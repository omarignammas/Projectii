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
import org.test.backendprojecty.dtos.request.CourseRequest;
import org.test.backendprojecty.dtos.request.PaginationRequest;
import org.test.backendprojecty.dtos.response.CourseProgressResponse;
import org.test.backendprojecty.dtos.response.CourseResponse;
import org.test.backendprojecty.dtos.response.PagingResult;
import org.test.backendprojecty.entity.Course;
import org.test.backendprojecty.entity.Term;
import org.test.backendprojecty.entity.User;
import org.test.backendprojecty.exception.ResourceNotFoundException;
import org.test.backendprojecty.mapper.CourseMapper;
import org.test.backendprojecty.repository.CourseRepository;
import org.test.backendprojecty.repository.TaskRepository;
import org.test.backendprojecty.repository.TermRepository;
import org.test.backendprojecty.security.CurrentUserProvider;

import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private TermRepository termRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private CourseMapper courseMapper;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private CourseService courseService;

    private User user;
    private Term term;
    private Course course;
    private CourseRequest courseRequest;
    private CourseResponse courseResponse;
    private PaginationRequest paginationRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .build();

        term = Term.builder()
                .id(1L)
                .name("Fall 2026")
                .user(user)
                .build();

        course = Course.builder()
                .id(1L)
                .title("Test Course")
                .description("Test Description")
                .term(term)
                .user(user)
                .build();

        courseRequest = CourseRequest.builder()
                .title("Test Course")
                .description("Test Description")
                .termId(1L)
                .build();

        courseResponse = CourseResponse.builder()
                .id(1L)
                .title("Test Course")
                .description("Test Description")
                .termId(1L)
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
    void createCourse_Success() {
        when(termRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(term));
        when(courseRepository.save(any(Course.class))).thenReturn(course);
        when(courseMapper.toResponse(course)).thenReturn(courseResponse);

        CourseResponse response = courseService.createCourse(courseRequest);

        assertNotNull(response);
        assertEquals("Test Course", response.getTitle());
        verify(courseRepository).save(any(Course.class));
    }

    @Test
    void getAllCourses_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Course> coursePage = new PageImpl<>(Arrays.asList(course), pageable, 1);

        when(courseRepository.findByUserIdAndDeletedFalse(eq(1L), any(Pageable.class)))
                .thenReturn(coursePage);
        when(courseMapper.toResponse(course)).thenReturn(courseResponse);

        PagingResult<CourseResponse> result = courseService.getAllCourses(paginationRequest);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(1, result.getTotalPages());
        assertEquals(1L, result.getTotalElements());
        assertEquals(1, result.getPage());
        assertEquals("Test Course", result.getContent().iterator().next().getTitle());
        verify(courseRepository).findByUserIdAndDeletedFalse(eq(1L), any(Pageable.class));
    }

    @Test
    void getCourseById_Success() {
        when(courseRepository.findByIdAndUserIdAndDeletedFalse(1L, 1L)).thenReturn(Optional.of(course));
        when(courseMapper.toResponse(course)).thenReturn(courseResponse);

        CourseResponse response = courseService.getCourseById(1L);

        assertNotNull(response);
        assertEquals("Test Course", response.getTitle());
    }

    @Test
    void getCourseById_NotFound_ThrowsException() {
        when(courseRepository.findByIdAndUserIdAndDeletedFalse(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> courseService.getCourseById(1L));
    }

    @Test
    void deleteCourse_SoftDeletes_DoesNotHardDelete() {
        when(courseRepository.findByIdAndUserIdAndDeletedFalse(1L, 1L)).thenReturn(Optional.of(course));

        courseService.deleteCourse(1L);

        assertTrue(course.isDeleted());
        verify(courseRepository).save(course);
        verify(courseRepository, never()).delete(any(Course.class));
    }

    @Test
    void getCourseProgress_Success() {
        when(courseRepository.findByIdAndUserIdAndDeletedFalse(1L, 1L)).thenReturn(Optional.of(course));
        when(taskRepository.countByCourseIdAndCompleted(1L, true)).thenReturn(5L);
        when(taskRepository.countByCourseIdAndCompleted(1L, false)).thenReturn(5L);

        CourseProgressResponse response = courseService.getCourseProgress(1L);

        assertNotNull(response);
        assertEquals(10L, response.getTotalTasks());
        assertEquals(5L, response.getCompletedTasks());
        assertEquals(50.0, response.getProgressPercentage());
    }
}
