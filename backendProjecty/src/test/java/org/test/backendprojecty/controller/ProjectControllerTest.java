package org.test.backendprojecty.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.test.backendprojecty.dtos.request.PaginationRequest;
import org.test.backendprojecty.dtos.request.ProjectRequest;
import org.test.backendprojecty.dtos.response.PagingResult;
import org.test.backendprojecty.dtos.response.ProjectProgressResponse;
import org.test.backendprojecty.dtos.response.ProjectResponse;
import org.test.backendprojecty.service.ProjectService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProjectController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProjectService projectService;

    private ProjectRequest projectRequest;
    private ProjectResponse projectResponse;
    private ProjectProgressResponse progressResponse;
    private PagingResult<ProjectResponse> pagingResult;

    @BeforeEach
    void setUp() {
        projectRequest = ProjectRequest.builder()
                .title("Test Project")
                .description("Test Description")
                .build();

        projectResponse = ProjectResponse.builder()
                .id(1L)
                .title("Test Project")
                .description("Test Description")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        progressResponse = ProjectProgressResponse.builder()
                .projectId(1L)
                .projectTitle("Test Project")
                .totalTasks(10L)
                .completedTasks(5L)
                .progressPercentage(50.0)
                .build();

        // Setup PagingResult
        List<ProjectResponse> content = Arrays.asList(projectResponse);
        pagingResult = new PagingResult<>(
                content,  // content
                1,        // totalPages
                1L,       // totalElements
                10,       // size
                0,        // page
                false     // empty
        );
    }

    @Test
    @WithMockUser
    void createProject_Success() throws Exception {
        // Given
        when(projectService.createProject(any(ProjectRequest.class))).thenReturn(projectResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(projectRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Project"))
                .andExpect(jsonPath("$.description").value("Test Description"));

        verify(projectService, times(1)).createProject(any(ProjectRequest.class));
    }

    @Test
    @WithMockUser
    void getAllProjects_Success() throws Exception {
        // Given
        when(projectService.getAllProjects(any(PaginationRequest.class))).thenReturn(pagingResult);

        // When & Then
        mockMvc.perform(get("/api/v1/projects")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sortField", "id")
                        .param("direction", "ASC")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(1L))
                .andExpect(jsonPath("$.content[0].title").value("Test Project"))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.empty").value(false));

        verify(projectService, times(1)).getAllProjects(any(PaginationRequest.class));
    }

    @Test
    @WithMockUser
    void getAllProjects_EmptyResult_Success() throws Exception {
        // Given
        PagingResult<ProjectResponse> emptyResult = new PagingResult<>(
                Collections.emptyList(),
                0,
                0L,
                10,
                0,
                true
        );
        when(projectService.getAllProjects(any(PaginationRequest.class))).thenReturn(emptyResult);

        // When & Then
        mockMvc.perform(get("/api/v1/projects")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalPages").value(0))
                .andExpect(jsonPath("$.totalElements").value(0))
                .andExpect(jsonPath("$.empty").value(true));

        verify(projectService, times(1)).getAllProjects(any(PaginationRequest.class));
    }

    @Test
    @WithMockUser
    void getAllProjects_WithCustomPagination_Success() throws Exception {
        // Given
        when(projectService.getAllProjects(any(PaginationRequest.class))).thenReturn(pagingResult);

        // When & Then
        mockMvc.perform(get("/api/v1/projects")
                        .param("page", "2")
                        .param("size", "5")
                        .param("sortField", "title")
                        .param("direction", "DESC")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        verify(projectService, times(1)).getAllProjects(any(PaginationRequest.class));
    }

    @Test
    @WithMockUser
    void getProjectById_Success() throws Exception {
        // Given
        when(projectService.getProjectById(1L)).thenReturn(projectResponse);

        // When & Then
        mockMvc.perform(get("/api/v1/projects/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Project"));

        verify(projectService, times(1)).getProjectById(1L);
    }

    @Test
    @WithMockUser
    void updateProject_Success() throws Exception {
        // Given
        ProjectRequest updateRequest = ProjectRequest.builder()
                .title("Updated Project")
                .description("Updated Description")
                .build();

        ProjectResponse updatedResponse = ProjectResponse.builder()
                .id(1L)
                .title("Updated Project")
                .description("Updated Description")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(projectService.updateProject(eq(1L), any(ProjectRequest.class))).thenReturn(updatedResponse);

        // When & Then
        mockMvc.perform(put("/api/v1/projects/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Project"))
                .andExpect(jsonPath("$.description").value("Updated Description"));

        verify(projectService, times(1)).updateProject(eq(1L), any(ProjectRequest.class));
    }

    @Test
    @WithMockUser
    void deleteProject_Success() throws Exception {
        // Given
        doNothing().when(projectService).deleteProject(1L);

        // When & Then
        mockMvc.perform(delete("/api/v1/projects/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(projectService, times(1)).deleteProject(1L);
    }

    @Test
    @WithMockUser
    void getProjectProgress_Success() throws Exception {
        // Given
        when(projectService.getProjectProgress(1L)).thenReturn(progressResponse);

        // When & Then
        mockMvc.perform(get("/api/v1/projects/1/progress")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectId").value(1L))
                .andExpect(jsonPath("$.totalTasks").value(10))
                .andExpect(jsonPath("$.completedTasks").value(5))
                .andExpect(jsonPath("$.progressPercentage").value(50.0));

        verify(projectService, times(1)).getProjectProgress(1L);
    }

    @Test
    @WithMockUser
    void createProject_InvalidInput_ReturnsBadRequest() throws Exception {
        // Given - Empty title
        ProjectRequest invalidRequest = ProjectRequest.builder()
                .title("")
                .description("Test Description")
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(projectService, never()).createProject(any(ProjectRequest.class));
    }

    @Test
    @WithMockUser
    void createProject_TitleTooLong_ReturnsBadRequest() throws Exception {
        // Given - Title exceeds max length
        String longTitle = "A".repeat(256); // Si max = 255
        ProjectRequest invalidRequest = ProjectRequest.builder()
                .title(longTitle)
                .description("Test Description")
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(projectService, never()).createProject(any(ProjectRequest.class));
    }

    @Test
    void getAllProjects_Unauthorized_WithoutAuthentication() throws Exception {
        // When & Then - Sans @WithMockUser
        mockMvc.perform(get("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verify(projectService, never()).getAllProjects(any(PaginationRequest.class));
    }

    @Test
    void createProject_Unauthorized_WithoutAuthentication() throws Exception {
        // When & Then - Sans @WithMockUser
        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(projectRequest)))
                .andExpect(status().isUnauthorized());

        verify(projectService, never()).createProject(any(ProjectRequest.class));
    }
}