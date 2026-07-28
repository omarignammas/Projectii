package org.test.backendprojecty.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.test.backendprojecty.config.PaginationUtils;
import org.test.backendprojecty.dtos.request.PaginationRequest;
import org.test.backendprojecty.dtos.response.NotificationResponse;
import org.test.backendprojecty.dtos.response.PagingResult;
import org.test.backendprojecty.entity.Notification;
import org.test.backendprojecty.entity.NotificationType;
import org.test.backendprojecty.entity.User;
import org.test.backendprojecty.exception.BadRequestException;
import org.test.backendprojecty.exception.ResourceNotFoundException;
import org.test.backendprojecty.repository.NotificationRepository;
import org.test.backendprojecty.security.CurrentUserProvider;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUserProvider currentUserProvider;
    private final SimpMessagingTemplate messagingTemplate;

    /** Called by other services (friend requests, room invites) — recipient is explicit, not "current user". */
    @Transactional
    public void notify(User recipient, NotificationType type, String title, String body, String link) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .body(body)
                .link(link)
                .build();
        notification = notificationRepository.save(notification);

        NotificationResponse response = toResponse(notification);
        messagingTemplate.convertAndSendToUser(recipient.getEmail(), "/queue/notifications", response);
    }

    @Transactional(readOnly = true)
    public PagingResult<NotificationResponse> listNotifications(PaginationRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Pageable pageable = PaginationUtils.getPageable(request);
        Page<Notification> page = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId(), pageable);

        List<NotificationResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new PagingResult<>(content, page.getTotalPages(), page.getTotalElements(), page.getSize(), page.getNumber(), page.isEmpty());
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        User currentUser = currentUserProvider.getCurrentUser();
        return notificationRepository.countByRecipientIdAndReadFalse(currentUser.getId());
    }

    @Transactional
    public void markRead(Long notificationId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new BadRequestException("This notification isn't yours");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead() {
        User currentUser = currentUserProvider.getCurrentUser();
        List<Notification> unread = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(currentUser.getId(), Pageable.unpaged())
                .getContent()
                .stream()
                .filter(n -> !n.isRead())
                .collect(Collectors.toList());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .body(notification.getBody())
                .link(notification.getLink())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
