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
import org.springframework.data.domain.Sort;
import org.test.backendprojecty.dtos.request.PaginationRequest;
import org.test.backendprojecty.dtos.request.TaskRequest;
import org.test.backendprojecty.dtos.response.PagingResult;
import org.test.backendprojecty.dtos.response.TaskResponse;
import org.test.backendprojecty.entity.Course;
import org.test.backendprojecty.entity.Task;
import org.test.backendprojecty.entity.User;
import org.test.backendprojecty.exception.ResourceNotFoundException;
import org.test.backendprojecty.mapper.TaskMapper;
import org.test.backendprojecty.repository.CourseRepository;
import org.test.backendprojecty.repository.TaskRepository;
import org.test.backendprojecty.security.CurrentUserProvider;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private CourseRepository courseRepository;

    @Mock
    private TaskMapper taskMapper;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private TaskService taskService;

    private User user;
    private Course course;
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

        course = Course.builder()
                .id(1L)
                .title("Test Course")
                .user(user)
                .build();

        task = Task.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .dueDate(LocalDate.now().plusDays(7))
                .completed(false)
                .user(user)
                .course(course)
                .build();

        taskRequest = TaskRequest.builder()
                .title("Test Task")
                .description("Test Description")
                .dueDate(LocalDate.now().plusDays(7))
                .courseId(1L)
                .build();

        taskResponse = TaskResponse.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .dueDate(LocalDate.now().plusDays(7))
                .completed(false)
                .courseId(1L)
                .build();

        paginationRequest = PaginationRequest.builder()
                .page(1)
                .size(10)
                .sortField("id")
                .direction(Sort.Direction.ASC)
                .build();

        lenient().when(currentUserProvider.getCurrentUser()).thenReturn(user);
    }

    @Test
    void createTask_Success() {
        when(courseRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(course));
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        TaskResponse response = taskService.createTask(taskRequest);

        assertNotNull(response);
        assertEquals("Test Task", response.getTitle());
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void createTask_WithoutCourse_Success() {
        TaskRequest personalRequest = TaskRequest.builder()
                .title("Personal Task")
                .build();
        Task personalTask = Task.builder()
                .id(2L)
                .title("Personal Task")
                .user(user)
                .build();
        TaskResponse personalResponse = TaskResponse.builder()
                .id(2L)
                .title("Personal Task")
                .build();

        when(taskRepository.save(any(Task.class))).thenReturn(personalTask);
        when(taskMapper.toResponse(personalTask)).thenReturn(personalResponse);

        TaskResponse response = taskService.createTask(personalRequest);

        assertNotNull(response);
        assertNull(response.getCourseId());
        verify(courseRepository, never()).findByIdAndUserId(any(), any());
    }

    @Test
    void getAllTasks_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> taskPage = new PageImpl<>(Arrays.asList(task), pageable, 1);

        when(taskRepository.findByUserId(eq(1L), any(Pageable.class)))
                .thenReturn(taskPage);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        PagingResult<TaskResponse> result = taskService.getAllTasks(null, paginationRequest);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(1, result.getTotalPages());
        assertEquals(1, result.getPage());
        assertEquals("Test Task", result.getContent().iterator().next().getTitle());
        verify(taskRepository).findByUserId(eq(1L), any(Pageable.class));
    }

    @Test
    void markTaskAsCompleted_Success() {
        when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        TaskResponse response = taskService.markTaskAsCompleted(1L);

        assertNotNull(response);
        assertTrue(task.isCompleted());
        assertNotNull(task.getCompletedAt());
        verify(taskRepository).save(task);
    }

    @Test
    void markTaskAsCompleted_Toggle_ClearsCompletedAt() {
        task.setCompleted(true);
        task.setCompletedAt(LocalDateTime.now());
        when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        taskService.markTaskAsCompleted(1L);

        assertFalse(task.isCompleted());
        assertNull(task.getCompletedAt());
    }

    @Test
    void deleteTask_Success() {
        when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(task));

        taskService.deleteTask(1L);

        verify(taskRepository).delete(task);
    }

    @Test
    void getTaskById_NotFound_ThrowsException() {
        when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> taskService.getTaskById(1L));
    }
}
