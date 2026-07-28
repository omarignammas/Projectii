package org.test.backendprojecty.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.test.backendprojecty.config.PaginationUtils;
import org.test.backendprojecty.dtos.request.FocusRoomRequest;
import org.test.backendprojecty.dtos.request.PaginationRequest;
import org.test.backendprojecty.dtos.response.FocusRoomResponse;
import org.test.backendprojecty.dtos.response.PagingResult;
import org.test.backendprojecty.entity.*;
import org.test.backendprojecty.exception.BadRequestException;
import org.test.backendprojecty.exception.ResourceNotFoundException;
import org.test.backendprojecty.mapper.FocusRoomMapper;
import org.test.backendprojecty.repository.CourseRepository;
import org.test.backendprojecty.repository.FocusRoomMessageRepository;
import org.test.backendprojecty.repository.FocusRoomParticipantRepository;
import org.test.backendprojecty.repository.FocusRoomRepository;
import org.test.backendprojecty.repository.UserRepository;
import org.test.backendprojecty.security.CurrentUserProvider;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FocusRoomService {

    private static final String CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String CODE_DIGITS = "0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final FocusRoomRepository focusRoomRepository;
    private final FocusRoomParticipantRepository participantRepository;
    private final FocusRoomMessageRepository messageRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final FocusRoomMapper focusRoomMapper;
    private final CurrentUserProvider currentUserProvider;
    private final SimpMessagingTemplate messagingTemplate;
    private final FocusRoomSchedulerService focusRoomSchedulerService;
    private final FriendService friendService;
    private final NotificationService notificationService;

    @Transactional
    public FocusRoomResponse createRoom(FocusRoomRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();

        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findByIdAndUserIdAndDeletedFalse(request.getCourseId(), currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));
        }

        FocusRoom room = FocusRoom.builder()
                .code(generateUniqueCode())
                .name(request.getName())
                .host(currentUser)
                .course(course)
                .workMinutes(request.getWorkMinutes())
                .breakMinutes(request.getBreakMinutes())
                .totalRounds(request.getTotalRounds())
                .longBreakMinutes(request.getLongBreakMinutes())
                .status(FocusRoomStatus.LOBBY)
                .currentRound(0)
                .locked(false)
                .chatMode(request.getChatMode() != null ? request.getChatMode() : ChatMode.CLOSED_FOCUS)
                .scheduledFor(request.getScheduledFor())
                .build();
        room = focusRoomRepository.save(room);

        FocusRoomParticipant hostParticipant = FocusRoomParticipant.builder()
                .room(room)
                .user(currentUser)
                .status(ParticipantStatus.JOINED)
                .joinedAt(LocalDateTime.now())
                .build();
        participantRepository.save(hostParticipant);

        if (request.getInviteUserIds() != null) {
            for (Long inviteUserId : request.getInviteUserIds()) {
                inviteFriendToRoom(room, currentUser, inviteUserId);
            }
        }

        return buildSnapshot(room);
    }

    @Transactional
    public FocusRoomResponse inviteToRoom(String code, Long friendUserId) {
        User currentUser = currentUserProvider.getCurrentUser();
        FocusRoom room = findRoomOrThrow(code);

        if (!room.getHost().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Only the host can invite people to this room");
        }
        if (room.getStatus() == FocusRoomStatus.COMPLETED) {
            throw new BadRequestException("This session has already ended");
        }

        inviteFriendToRoom(room, currentUser, friendUserId);
        return buildSnapshotAndBroadcast(room);
    }

    private void inviteFriendToRoom(FocusRoom room, User host, Long friendUserId) {
        if (!friendService.areFriends(host.getId(), friendUserId)) {
            throw new BadRequestException("You can only invite friends to a Focus Room");
        }

        User invitee = userRepository.findById(friendUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + friendUserId));

        boolean alreadyInvolved = participantRepository.findByRoomIdAndUserId(room.getId(), invitee.getId()).isPresent();
        if (alreadyInvolved) {
            return;
        }

        FocusRoomParticipant invited = FocusRoomParticipant.builder()
                .room(room)
                .user(invitee)
                .status(ParticipantStatus.INVITED)
                .build();
        participantRepository.save(invited);

        String when = room.getScheduledFor() != null ? " (scheduled for " + room.getScheduledFor() + ")" : "";
        notificationService.notify(invitee, NotificationType.FOCUS_ROOM_INVITE,
                "Focus Room invite",
                displayName(host) + " invited you to \"" + room.getName() + "\"" + when,
                "/focus-rooms/" + room.getCode());
    }

    @Transactional(readOnly = true)
    public PagingResult<FocusRoomResponse> getAllRooms(PaginationRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();

        Pageable pageable = PaginationUtils.getPageable(request);
        Page<FocusRoom> roomsPage = focusRoomRepository.findByHostOrParticipant(currentUser.getId(), pageable);

        List<FocusRoomResponse> content = roomsPage.getContent()
                .stream()
                .map(room -> focusRoomMapper.toResponse(room, participantRepository.findByRoomIdOrderByCreatedAtAsc(room.getId()), Collections.emptyList()))
                .collect(Collectors.toList());

        return new PagingResult<>(
                content,
                roomsPage.getTotalPages(),
                roomsPage.getTotalElements(),
                roomsPage.getSize(),
                roomsPage.getNumber(),
                roomsPage.isEmpty()
        );
    }

    @Transactional(readOnly = true)
    public FocusRoomResponse getRoomByCode(String code) {
        FocusRoom room = findRoomOrThrow(code);
        return buildSnapshot(room);
    }

    @Transactional
    public FocusRoomResponse joinRoom(String code) {
        User currentUser = currentUserProvider.getCurrentUser();
        FocusRoom room = findRoomOrThrow(code);

        if (room.getStatus() == FocusRoomStatus.COMPLETED) {
            throw new BadRequestException("This session has already ended");
        }

        FocusRoomParticipant participant = participantRepository
                .findByRoomIdAndUserId(room.getId(), currentUser.getId())
                .orElse(null);

        boolean isFreshJoin;
        if (participant == null) {
            if (room.isLocked()) {
                throw new BadRequestException("This room is locked by the host");
            }
            participant = FocusRoomParticipant.builder()
                    .room(room)
                    .user(currentUser)
                    .status(ParticipantStatus.JOINED)
                    .joinedAt(LocalDateTime.now())
                    .build();
            isFreshJoin = true;
        } else if (participant.getStatus() == ParticipantStatus.INVITED || participant.getStatus() == ParticipantStatus.QUIT) {
            if (room.isLocked() && participant.getStatus() != ParticipantStatus.INVITED) {
                throw new BadRequestException("This room is locked by the host");
            }
            participant.setStatus(ParticipantStatus.JOINED);
            participant.setJoinedAt(LocalDateTime.now());
            participant.setLeftAt(null);
            isFreshJoin = true;
        } else {
            isFreshJoin = false;
        }
        participantRepository.save(participant);

        if (isFreshJoin) {
            postSystemMessage(room, displayName(currentUser) + " joined");
        }

        return buildSnapshotAndBroadcast(room);
    }

    @Transactional
    public FocusRoomResponse rematchRoom(String code) {
        User currentUser = currentUserProvider.getCurrentUser();
        FocusRoom oldRoom = findRoomOrThrow(code);

        if (!oldRoom.getHost().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Only the host can start a rematch");
        }
        if (oldRoom.getStatus() != FocusRoomStatus.COMPLETED) {
            throw new BadRequestException("Can only rematch a completed session");
        }

        FocusRoom newRoom = FocusRoom.builder()
                .code(generateUniqueCode())
                .name(oldRoom.getName())
                .host(oldRoom.getHost())
                .course(oldRoom.getCourse())
                .workMinutes(oldRoom.getWorkMinutes())
                .breakMinutes(oldRoom.getBreakMinutes())
                .totalRounds(oldRoom.getTotalRounds())
                .longBreakMinutes(oldRoom.getLongBreakMinutes())
                .status(FocusRoomStatus.LOBBY)
                .currentRound(0)
                .locked(false)
                .build();
        newRoom = focusRoomRepository.save(newRoom);

        FocusRoomParticipant hostParticipant = FocusRoomParticipant.builder()
                .room(newRoom)
                .user(currentUser)
                .status(ParticipantStatus.JOINED)
                .joinedAt(LocalDateTime.now())
                .build();
        participantRepository.save(hostParticipant);

        List<FocusRoomParticipant> oldParticipants = participantRepository.findByRoomIdOrderByCreatedAtAsc(oldRoom.getId());
        for (FocusRoomParticipant oldParticipant : oldParticipants) {
            if (oldParticipant.getUser().getId().equals(currentUser.getId())) {
                continue;
            }
            FocusRoomParticipant invited = FocusRoomParticipant.builder()
                    .room(newRoom)
                    .user(oldParticipant.getUser())
                    .status(ParticipantStatus.INVITED)
                    .build();
            participantRepository.save(invited);
        }

        return buildSnapshot(newRoom);
    }

    /**
     * The four methods below are invoked from FocusRoomStompController rather than
     * REST, so the current user arrives as an explicit param instead of via
     * CurrentUserProvider — STOMP message handling never populates SecurityContextHolder.
     */
    @Transactional
    public void startSession(String code, User currentUser) {
        FocusRoom room = findRoomOrThrow(code);

        if (!room.getHost().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Only the host can start the session");
        }
        if (room.getStatus() != FocusRoomStatus.LOBBY) {
            throw new BadRequestException("This session has already started");
        }

        room.setStatus(FocusRoomStatus.ACTIVE);
        room.setCurrentRound(1);
        room.setCurrentPhase(FocusPhase.WORK);
        room.setPhaseEndsAt(Instant.now().plusSeconds(room.getWorkMinutes() * 60L));
        room = focusRoomRepository.save(room);

        List<FocusRoomParticipant> participants = participantRepository.findByRoomIdOrderByCreatedAtAsc(room.getId());
        for (FocusRoomParticipant p : participants) {
            if (p.getStatus() == ParticipantStatus.JOINED) {
                p.setStatus(ParticipantStatus.FOCUSING);
            }
        }
        participantRepository.saveAll(participants);

        postSystemMessage(room, "Round 1 starting");
        buildSnapshotAndBroadcast(room);
        focusRoomSchedulerService.scheduleNextPhase(room);
    }

    @Transactional
    public void endSession(String code, User currentUser) {
        FocusRoom room = findRoomOrThrow(code);

        if (!room.getHost().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Only the host can end the session");
        }
        if (room.getStatus() != FocusRoomStatus.ACTIVE) {
            throw new BadRequestException("This session isn't active");
        }

        List<FocusRoomParticipant> participants = participantRepository.findByRoomIdOrderByCreatedAtAsc(room.getId());

        // Credit whatever's elapsed in the current WORK block — a host ending
        // early shouldn't zero out real focus time just because the block
        // didn't run to completion the way advancePhase's full-block credit does.
        if (room.getCurrentPhase() == FocusPhase.WORK && room.getPhaseEndsAt() != null) {
            Instant phaseStartedAt = room.getPhaseEndsAt().minusSeconds(room.getWorkMinutes() * 60L);
            long elapsedMinutes = Math.min(room.getWorkMinutes(),
                    Math.max(0, Duration.between(phaseStartedAt, Instant.now()).toMinutes()));
            for (FocusRoomParticipant p : participants) {
                if (p.getStatus() == ParticipantStatus.FOCUSING) {
                    p.setMinutesFocused(p.getMinutesFocused() + (int) elapsedMinutes);
                }
            }
        }

        for (FocusRoomParticipant p : participants) {
            if (p.getStatus() == ParticipantStatus.FOCUSING || p.getStatus() == ParticipantStatus.ON_BREAK) {
                p.setStatus(ParticipantStatus.COMPLETED);
            }
        }
        participantRepository.saveAll(participants);

        room.setStatus(FocusRoomStatus.COMPLETED);
        room.setPhaseEndsAt(null);
        focusRoomRepository.save(room);

        focusRoomSchedulerService.cancelScheduledTask(room.getId());
        postSystemMessage(room, "Host ended the session early");
        buildSnapshotAndBroadcast(room);
    }

    @Transactional
    public void leaveRoom(String code, User currentUser) {
        FocusRoom room = findRoomOrThrow(code);
        FocusRoomParticipant participant = participantRepository
                .findByRoomIdAndUserId(room.getId(), currentUser.getId())
                .orElseThrow(() -> new BadRequestException("You are not in this room"));

        if (participant.getStatus() == ParticipantStatus.QUIT || participant.getStatus() == ParticipantStatus.COMPLETED) {
            return;
        }

        participant.setStatus(ParticipantStatus.QUIT);
        participant.setLeftAt(LocalDateTime.now());
        participantRepository.save(participant);

        String suffix = room.getStatus() == FocusRoomStatus.ACTIVE ? " (Round " + room.getCurrentRound() + ")" : "";
        postSystemMessage(room, displayName(currentUser) + " quit" + suffix);
        buildSnapshotAndBroadcast(room);
    }

    @Transactional
    public void toggleHand(String code, User currentUser) {
        FocusRoom room = findRoomOrThrow(code);
        FocusRoomParticipant participant = participantRepository
                .findByRoomIdAndUserId(room.getId(), currentUser.getId())
                .orElseThrow(() -> new BadRequestException("You are not in this room"));

        if (participant.getStatus() == ParticipantStatus.QUIT
                || participant.getStatus() == ParticipantStatus.COMPLETED
                || participant.getStatus() == ParticipantStatus.INVITED) {
            throw new BadRequestException("You can't raise your hand right now");
        }

        participant.setHandRaised(!participant.isHandRaised());
        participantRepository.save(participant);

        if (participant.isHandRaised()) {
            postSystemMessage(room, displayName(currentUser) + " raised a hand");
        }
        buildSnapshotAndBroadcast(room);
    }

    @Transactional
    public void postChatMessage(String code, User currentUser, String body) {
        FocusRoom room = findRoomOrThrow(code);
        FocusRoomParticipant participant = participantRepository
                .findByRoomIdAndUserId(room.getId(), currentUser.getId())
                .orElseThrow(() -> new BadRequestException("You are not in this room"));

        if (participant.getStatus() == ParticipantStatus.QUIT || participant.getStatus() == ParticipantStatus.INVITED) {
            throw new BadRequestException("You can't chat in this room");
        }

        boolean inFocusBlock = room.getStatus() == FocusRoomStatus.ACTIVE && room.getCurrentPhase() == FocusPhase.WORK;
        if (inFocusBlock) {
            if (room.getChatMode() == ChatMode.CLOSED_FOCUS) {
                throw new BadRequestException("Chat is locked during a focus block — reactions only");
            }
            if (room.getChatMode() == ChatMode.EMOJI_ONLY_FOCUS && !isEmojiOnly(body)) {
                throw new BadRequestException("Only emoji reactions are allowed during a focus block");
            }
        }

        FocusRoomMessage message = FocusRoomMessage.builder()
                .room(room)
                .sender(currentUser)
                .type(FocusMessageType.CHAT)
                .body(body)
                .build();
        messageRepository.save(message);

        buildSnapshotAndBroadcast(room);
    }

    @Transactional
    public void updateChatMode(String code, User currentUser, ChatMode mode) {
        FocusRoom room = findRoomOrThrow(code);

        if (!room.getHost().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Only the host can change room settings");
        }
        if (room.getStatus() == FocusRoomStatus.COMPLETED) {
            throw new BadRequestException("This session has already ended");
        }

        room.setChatMode(mode);
        focusRoomRepository.save(room);

        postSystemMessage(room, "Host set chat to \"" + describeChatMode(mode) + "\"");
        buildSnapshotAndBroadcast(room);
    }

    private static boolean isEmojiOnly(String text) {
        String stripped = text.replaceAll("\\s+", "");
        if (stripped.isEmpty()) {
            return false;
        }
        return stripped.codePoints().allMatch(FocusRoomService::isEmojiCodePoint);
    }

    // A pragmatic range check, not a fully spec-correct Unicode grapheme-cluster
    // validator — good enough to distinguish "typed a sentence" from "sent emoji".
    private static boolean isEmojiCodePoint(int cp) {
        return (cp >= 0x1F300 && cp <= 0x1FAFF)
                || (cp >= 0x2600 && cp <= 0x27BF)
                || (cp >= 0x2190 && cp <= 0x21FF)
                || (cp >= 0x2B00 && cp <= 0x2BFF)
                || (cp >= 0x1F1E6 && cp <= 0x1F1FF)
                || cp == 0xFE0F
                || cp == 0x200D;
    }

    private static String describeChatMode(ChatMode mode) {
        return switch (mode) {
            case OPEN -> "Open chat";
            case EMOJI_ONLY_FOCUS -> "Emoji-only during focus";
            case CLOSED_FOCUS -> "Closed during focus";
        };
    }

    private FocusRoom findRoomOrThrow(String code) {
        return focusRoomRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Focus room not found with code: " + code));
    }

    private FocusRoomResponse buildSnapshot(FocusRoom room) {
        List<FocusRoomParticipant> participants = participantRepository.findByRoomIdOrderByCreatedAtAsc(room.getId());
        List<FocusRoomMessage> messages = messageRepository.findTop50ByRoomIdOrderByCreatedAtDesc(room.getId());
        Collections.reverse(messages);
        return focusRoomMapper.toResponse(room, participants, messages);
    }

    private FocusRoomResponse buildSnapshotAndBroadcast(FocusRoom room) {
        FocusRoomResponse snapshot = buildSnapshot(room);
        messagingTemplate.convertAndSend("/topic/rooms/" + room.getCode(), snapshot);
        return snapshot;
    }

    private void postSystemMessage(FocusRoom room, String body) {
        FocusRoomMessage message = FocusRoomMessage.builder()
                .room(room)
                .sender(null)
                .type(FocusMessageType.SYSTEM)
                .body(body)
                .build();
        messageRepository.save(message);
    }

    private String displayName(User user) {
        return user.getFirstName() + " " + user.getLastName();
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = randomCode();
        } while (focusRoomRepository.existsByCode(code));
        return code;
    }

    private String randomCode() {
        StringBuilder letters = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            letters.append(CODE_LETTERS.charAt(RANDOM.nextInt(CODE_LETTERS.length())));
        }
        StringBuilder digits = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            digits.append(CODE_DIGITS.charAt(RANDOM.nextInt(CODE_DIGITS.length())));
        }
        return letters + "-" + digits;
    }
}
