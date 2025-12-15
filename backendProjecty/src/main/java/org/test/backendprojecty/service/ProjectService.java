package org.test.backendprojecty.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.test.backendprojecty.config.PaginationUtils;
import org.test.backendprojecty.dtos.request.PaginationRequest;
import org.test.backendprojecty.dtos.request.ProjectRequest;
import org.test.backendprojecty.dtos.response.ProjectProgressResponse;
import org.test.backendprojecty.dtos.response.ProjectResponse;
import org.test.backendprojecty.dtos.response.PagingResult;
import org.test.backendprojecty.entity.Project;
import org.test.backendprojecty.entity.User;
import org.test.backendprojecty.exception.BadRequestException;
import org.test.backendprojecty.exception.ResourceNotFoundException;
import org.test.backendprojecty.exception.UnauthorizedException;
import org.test.backendprojecty.mapper.ProjectMapper;
import org.test.backendprojecty.repository.ProjectRepository;
import org.test.backendprojecty.repository.TaskRepository;
import org.test.backendprojecty.repository.UserRepository;
import org.test.backendprojecty.security.SecurityUser;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ProjectMapper projectMapper;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        return userRepository.findById(securityUser.getUser().getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        User currentUser = getCurrentUser();

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .user(currentUser)
                .build();

        if (projectRepository.existsByTitleAndUserId(request.getTitle(),currentUser.getId())) {
            throw new BadRequestException("Project title already exists");
        }

        project = projectRepository.save(project);
        return projectMapper.toResponse(project);
    }

    @Transactional(readOnly = true)
    public PagingResult<ProjectResponse> getAllProjects(PaginationRequest request) {

        User currentUser = getCurrentUser();

        Pageable pageable = PaginationUtils.getPageable(request);

        Page<Project> projectsPage =
                projectRepository.findByUserId(currentUser.getId(), pageable);

        List<ProjectResponse> content = projectsPage.getContent()
                .stream()
                .map(projectMapper::toResponse)
                .collect(Collectors.toList());

        return new PagingResult<>(
                content,
                projectsPage.getTotalPages(),
                projectsPage.getTotalElements(),
                projectsPage.getSize(),
                projectsPage.getNumber(),
                projectsPage.isEmpty()
        );
    }


    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long projectId) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findByIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        return projectMapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectRequest request) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findByIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());

        project = projectRepository.save(project);
        return projectMapper.toResponse(project);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findByIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public ProjectProgressResponse getProjectProgress(Long projectId) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findByIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        long totalTasks = taskRepository.countByProjectIdAndCompleted(projectId, true) +
                taskRepository.countByProjectIdAndCompleted(projectId, false);
        long completedTasks = taskRepository.countByProjectIdAndCompleted(projectId, true);

        double progressPercentage = totalTasks > 0 ? (completedTasks * 100.0) / totalTasks : 0.0;

        return ProjectProgressResponse.builder()
                .projectId(project.getId())
                .projectTitle(project.getTitle())
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .progressPercentage(Math.round(progressPercentage * 100.0) / 100.0)
                .build();
    }
}
