package org.test.backendprojecty.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.test.backendprojecty.dtos.request.TaskRequest;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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
    }

    @Test
    void createTask_Success() {
        // Given
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        // When
        TaskResponse response = taskService.createTask(1L, taskRequest);

        // Then
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
        when(taskRepository.findByProjectId(1L)).thenReturn(Arrays.asList(task));
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        // When
        List<TaskResponse> responses = taskService.getAllTasksByProject(1L);

        // Then
        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(taskRepository).findByProjectId(1L);
    }

    @Test
    void markTaskAsCompleted_Success() {
        // Given
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(taskRepository.findByIdAndProjectId(1L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        // When
        TaskResponse response = taskService.markTaskAsCompleted(1L, 1L);

        // Then
        assertNotNull(response);
        assertTrue(task.isCompleted());
        verify(taskRepository).save(task);
    }

    @Test
    void deleteTask_Success() {
        // Given
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(taskRepository.findByIdAndProjectId(1L, 1L)).thenReturn(Optional.of(task));

        // When
        taskService.deleteTask(1L, 1L);

        // Then
        verify(taskRepository).delete(task);
    }

    @Test
    void getTaskById_NotFound_ThrowsException() {
        // Given
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(taskRepository.findByIdAndProjectId(1L, 1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> taskService.getTaskById(1L, 1L));
    }

    private void mockSecurityContext() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(new SecurityUser(user));
    }
}
