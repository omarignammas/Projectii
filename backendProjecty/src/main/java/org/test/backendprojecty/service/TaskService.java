package org.test.backendprojecty.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.test.backendprojecty.config.PaginationUtils;
import org.test.backendprojecty.dtos.request.PaginationRequest;
import org.test.backendprojecty.dtos.request.TaskRequest;
import org.test.backendprojecty.dtos.response.PagingResult;
import org.test.backendprojecty.dtos.response.TaskResponse;
import org.test.backendprojecty.entity.Course;
import org.test.backendprojecty.entity.Task;
import org.test.backendprojecty.entity.TaskPriority;
import org.test.backendprojecty.entity.TaskType;
import org.test.backendprojecty.entity.User;
import org.test.backendprojecty.exception.BadRequestException;
import org.test.backendprojecty.exception.ResourceNotFoundException;
import org.test.backendprojecty.mapper.TaskMapper;
import org.test.backendprojecty.repository.CourseRepository;
import org.test.backendprojecty.repository.TaskRepository;
import org.test.backendprojecty.security.CurrentUserProvider;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final CourseRepository courseRepository;
    private final TaskMapper taskMapper;
    private final CurrentUserProvider currentUserProvider;

    private Course resolveCourse(Long courseId, User currentUser) {
        if (courseId == null) {
            return null;
        }
        return courseRepository.findByIdAndUserId(courseId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Course course = resolveCourse(request.getCourseId(), currentUser);

        if (taskRepository.existsByTitleAndUserId(request.getTitle(), currentUser.getId())) {
            throw new BadRequestException("Task title already exists");
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .completed(false)
                .type(request.getType() != null ? request.getType() : TaskType.PERSONAL)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .user(currentUser)
                .course(course)
                .build();

        task = taskRepository.save(task);
        return taskMapper.toResponse(task);
    }

    @Transactional(readOnly = true)
    public PagingResult<TaskResponse> getAllTasks(Long courseId, PaginationRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();

        Pageable pageable = PaginationUtils.getPageable(request);

        Page<Task> taskPage = courseId != null
                ? taskRepository.findByUserIdAndCourseId(currentUser.getId(), courseId, pageable)
                : taskRepository.findByUserId(currentUser.getId(), pageable);

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
    public TaskResponse getTaskById(Long taskId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Task task = taskRepository.findByIdAndUserId(taskId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        return taskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Task task = taskRepository.findByIdAndUserId(taskId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        Course course = resolveCourse(request.getCourseId(), currentUser);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setCourse(course);
        task.setType(request.getType() != null ? request.getType() : TaskType.PERSONAL);
        task.setPriority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM);

        task = taskRepository.save(task);
        return taskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse markTaskAsCompleted(Long taskId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Task task = taskRepository.findByIdAndUserId(taskId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        boolean nowCompleted = !task.isCompleted();
        task.setCompleted(nowCompleted);
        task.setCompletedAt(nowCompleted ? LocalDateTime.now() : null);
        task = taskRepository.save(task);
        return taskMapper.toResponse(task);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Task task = taskRepository.findByIdAndUserId(taskId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        taskRepository.delete(task);
    }
}
