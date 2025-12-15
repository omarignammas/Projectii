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
import org.test.backendprojecty.dtos.request.ProjectRequest;
import org.test.backendprojecty.dtos.response.ProjectProgressResponse;
import org.test.backendprojecty.dtos.response.ProjectResponse;
import org.test.backendprojecty.entity.Project;
import org.test.backendprojecty.entity.User;
import org.test.backendprojecty.exception.ResourceNotFoundException;
import org.test.backendprojecty.mapper.ProjectMapper;
import org.test.backendprojecty.repository.ProjectRepository;
import org.test.backendprojecty.repository.TaskRepository;
import org.test.backendprojecty.repository.UserRepository;
import org.test.backendprojecty.security.SecurityUser;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectMapper projectMapper;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ProjectService projectService;

    private User user;
    private Project project;
    private ProjectRequest projectRequest;
    private ProjectResponse projectResponse;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .build();

        project = Project.builder()
                .id(1L)
                .title("Test Project")
                .description("Test Description")
                .user(user)
                .build();

        projectRequest = ProjectRequest.builder()
                .title("Test Project")
                .description("Test Description")
                .build();

        projectResponse = ProjectResponse.builder()
                .id(1L)
                .title("Test Project")
                .description("Test Description")
                .build();
    }

    @Test
    void createProject_Success() {
        // Given
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        when(projectMapper.toResponse(project)).thenReturn(projectResponse);

        // When
        ProjectResponse response = projectService.createProject(projectRequest);

        // Then
        assertNotNull(response);
        assertEquals("Test Project", response.getTitle());
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void getAllProjects_Success() {
        // Given
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByUserId(1L)).thenReturn(Arrays.asList(project));
        when(projectMapper.toResponse(project)).thenReturn(projectResponse);

        // When
        List<ProjectResponse> responses = projectService.getAllProjects();

        // Then
        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(projectRepository).findByUserId(1L);
    }

    @Test
    void getProjectById_Success() {
        // Given
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(projectMapper.toResponse(project)).thenReturn(projectResponse);

        // When
        ProjectResponse response = projectService.getProjectById(1L);

        // Then
        assertNotNull(response);
        assertEquals("Test Project", response.getTitle());
    }

    @Test
    void getProjectById_NotFound_ThrowsException() {
        // Given
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> projectService.getProjectById(1L));
    }

    @Test
    void deleteProject_Success() {
        // Given
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));

        // When
        projectService.deleteProject(1L);

        // Then
        verify(projectRepository).delete(project);
    }

    @Test
    void getProjectProgress_Success() {
        // Given
        mockSecurityContext();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(taskRepository.countByProjectIdAndCompleted(1L, true)).thenReturn(5L);
        when(taskRepository.countByProjectIdAndCompleted(1L, false)).thenReturn(5L);

        // When
        ProjectProgressResponse response = projectService.getProjectProgress(1L);

        // Then
        assertNotNull(response);
        assertEquals(10L, response.getTotalTasks());
        assertEquals(5L, response.getCompletedTasks());
        assertEquals(50.0, response.getProgressPercentage());
    }

    private void mockSecurityContext() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(new SecurityUser(user));
    }
}

