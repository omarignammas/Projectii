package org.test.backendprojecty.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.test.backendprojecty.config.PaginationUtils;
import org.test.backendprojecty.dtos.request.PaginationRequest;
import org.test.backendprojecty.dtos.request.TaskRequest;
import org.test.backendprojecty.dtos.response.PagingResult;
import org.test.backendprojecty.dtos.response.TaskResponse;
import org.test.backendprojecty.entity.Project;
import org.test.backendprojecty.entity.Task;
import org.test.backendprojecty.entity.User;
import org.test.backendprojecty.exception.BadRequestException;
import org.test.backendprojecty.exception.ResourceNotFoundException;
import org.test.backendprojecty.exception.UnauthorizedException;
import org.test.backendprojecty.mapper.TaskMapper;
import org.test.backendprojecty.repository.ProjectRepository;
import org.test.backendprojecty.repository.TaskRepository;
import org.test.backendprojecty.repository.UserRepository;
import org.test.backendprojecty.security.SecurityUser;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        return userRepository.findById(securityUser.getUser().getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    @Transactional
    public TaskResponse createTask(Long projectId, TaskRequest request) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findByIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .completed(false)
                .project(project)
                .build();

        if (taskRepository.existsByTitleAndProject_Id(request.getTitle(),projectId)) {
            throw new BadRequestException("Task title already exists");
        }

        task = taskRepository.save(task);
        return taskMapper.toResponse(task);
    }

    @Transactional(readOnly = true)
    public PagingResult<TaskResponse> getAllTasksByProject(
            Long projectId,
            PaginationRequest request
    ) {
        User currentUser = getCurrentUser();

        projectRepository.findByIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found with id: " + projectId
                        )
                );

        Pageable pageable = PaginationUtils.getPageable(request);

        Page<Task> taskPage =
                taskRepository.findByProjectId(projectId, pageable);

        List<TaskResponse> content = taskPage.getContent()
                .stream()
                .map(taskMapper::toResponse)
                .collect(Collectors.toList());

        return new PagingResult<>(
                content,
                taskPage.getTotalPages(),
                taskPage.getTotalElements(),
                taskPage.getSize(),
                taskPage.getNumber(),
                taskPage.isEmpty()
        );
    }


    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long projectId, Long taskId) {
        User currentUser = getCurrentUser();
        projectRepository.findByIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Task task = taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        return taskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(Long projectId, Long taskId, TaskRequest request) {
        User currentUser = getCurrentUser();
        projectRepository.findByIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Task task = taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());

        task = taskRepository.save(task);
        return taskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse markTaskAsCompleted(Long projectId, Long taskId) {
        User currentUser = getCurrentUser();
        projectRepository.findByIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Task task = taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        if (task.isCompleted()) {
            task.setCompleted(false);
        }else{
            task.setCompleted(true);
        }
        task = taskRepository.save(task);
        return taskMapper.toResponse(task);
    }

    @Transactional
    public void deleteTask(Long projectId, Long taskId) {
        User currentUser = getCurrentUser();
        projectRepository.findByIdAndUserId(projectId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Task task = taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        taskRepository.delete(task);
    }
}
