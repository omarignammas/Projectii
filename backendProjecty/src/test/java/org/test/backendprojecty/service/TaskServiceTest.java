package org.test.backendprojecty.service;


import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.test.backendprojecty.dtos.request.PaginationRequest;
import org.test.backendprojecty.dtos.request.TaskRequest;
import org.test.backendprojecty.dtos.response.PagingResult;
import org.test.backendprojecty.dtos.response.TaskResponse;
import org.test.backendprojecty.entity.Project;
import org.test.backendprojecty.entity.Task;
import org.test.backendprojecty.entity.User;
import org.test.backendprojecty.exception.ResourceNotFoundException;
import org.test.backendprojecty.mapper.TaskMapper;
import org.test.backendprojecty.repository.ProjectRepository;
import org.test.backendprojecty.repository.TaskRepository;
import org.test.backendprojecty.repository.UserRepository;
import org.test.backendprojecty.security.SecurityUser;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TaskMapper taskMapper;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private TaskService taskService;

    private User user;
    private Project project;
    private Task task;
    private TaskRequest taskRequest;
    private TaskResponse taskResponse;
    private PaginationRequest paginationRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .build();

        project = Project.builder()
                .id(1L)
                .title("Test Project")
                .user(user)
                .build();

        task = Task.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .dueDate(LocalDate.now().plusDays(7))
                .completed(false)
                .project(project)
                .build();

        taskRequest = TaskRequest.builder()
                .title("Test Task")
                .description("Test Description")
                .dueDate(LocalDate.now().plusDays(7))
                .build();

        taskResponse = TaskResponse.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .dueDate(LocalDate.now().plusDays(7))
                .completed(false)
                .projectId(1L)
                .build();

        paginationRequest = PaginationRequest.builder()
                .page(0)
                .size(10)
                .sortField("id")
                .direction("ASC")
                .build();
    }

    @Test
    void createTask_Success() {
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        TaskResponse response = taskService.createTask(1L, taskRequest);

        assertNotNull(response);
        assertEquals("Test Task", response.getTitle());
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void getAllTasksByProject_Success() {
        // Given
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));

        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> taskPage = new PageImpl<>(Arrays.asList(task), pageable, 1);

        when(taskRepository.findByProjectId(eq(1L), any(Pageable.class)))
                .thenReturn(taskPage);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        // When
        PagingResult<TaskResponse> result = taskService.getAllTasksByProject(1L, paginationRequest);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(1, result.getTotalPages());
        assertEquals("Test Task", result.getContent().get(0).getTitle());
        verify(taskRepository).findByProjectId(eq(1L), any(Pageable.class));
    }

    @Test
    void getAllTasksByProject_EmptyResult() {
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));

        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> emptyPage = new PageImpl<>(Arrays.asList(), pageable, 0);

        when(taskRepository.findByProjectId(eq(1L), any(Pageable.class)))
                .thenReturn(emptyPage);

        PagingResult<TaskResponse> result = taskService.getAllTasksByProject(1L, paginationRequest);

        assertNotNull(result);
        assertEquals(0, result.getContent().size());
        assertTrue(result.getEmpty());
    }

    @Test
    void markTaskAsCompleted_Success() {
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(taskRepository.findByIdAndProjectId(1L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        TaskResponse response = taskService.markTaskAsCompleted(1L, 1L);

        assertNotNull(response);
        assertTrue(task.isCompleted());
        verify(taskRepository).save(task);
    }

    @Test
    void deleteTask_Success() {
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(taskRepository.findByIdAndProjectId(1L, 1L)).thenReturn(Optional.of(task));

        taskService.deleteTask(1L, 1L);

        verify(taskRepository).delete(task);
    }

    @Test
    void getTaskById_NotFound_ThrowsException() {
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(taskRepository.findByIdAndProjectId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> taskService.getTaskById(1L, 1L));
    }

    private void mockSecurityContext() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(
                new SecurityUser(user)
        );
    }
}