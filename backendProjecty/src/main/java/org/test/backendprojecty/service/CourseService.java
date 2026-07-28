package org.test.backendprojecty.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.test.backendprojecty.config.PaginationUtils;
import org.test.backendprojecty.dtos.request.CourseRequest;
import org.test.backendprojecty.dtos.request.PaginationRequest;
import org.test.backendprojecty.dtos.response.CourseProgressResponse;
import org.test.backendprojecty.dtos.response.CourseResponse;
import org.test.backendprojecty.dtos.response.PagingResult;
import org.test.backendprojecty.entity.Course;
import org.test.backendprojecty.entity.Term;
import org.test.backendprojecty.entity.User;
import org.test.backendprojecty.exception.BadRequestException;
import org.test.backendprojecty.exception.ResourceNotFoundException;
import org.test.backendprojecty.mapper.CourseMapper;
import org.test.backendprojecty.repository.CourseRepository;
import org.test.backendprojecty.repository.TaskRepository;
import org.test.backendprojecty.repository.TermRepository;
import org.test.backendprojecty.security.CurrentUserProvider;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final TermRepository termRepository;
    private final TaskRepository taskRepository;
    private final CourseMapper courseMapper;
    private final CurrentUserProvider currentUserProvider;

    private Term resolveTerm(Long termId, User currentUser) {
        return termRepository.findByIdAndUserId(termId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Term not found with id: " + termId));
    }

    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Term term = resolveTerm(request.getTermId(), currentUser);

        if (courseRepository.existsByTitleAndUserId(request.getTitle(), currentUser.getId())) {
            throw new BadRequestException("Course title already exists");
        }

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .term(term)
                .colorTag(request.getColorTag())
                .instructorName(request.getInstructorName())
                .instructorEmail(request.getInstructorEmail())
                .user(currentUser)
                .build();

        course = courseRepository.save(course);
        return courseMapper.toResponse(course);
    }

    @Transactional(readOnly = true)
    public PagingResult<CourseResponse> getAllCourses(PaginationRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();

        Pageable pageable = PaginationUtils.getPageable(request);
        Page<Course> coursesPage = courseRepository.findByUserIdAndDeletedFalse(currentUser.getId(), pageable);

        List<CourseResponse> content = coursesPage.getContent()
                .stream()
                .map(courseMapper::toResponse)
                .collect(Collectors.toList());

        return new PagingResult<>(
                content,
                coursesPage.getTotalPages(),
                coursesPage.getTotalElements(),
                coursesPage.getSize(),
                coursesPage.getNumber(),
                coursesPage.isEmpty()
        );
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long courseId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Course course = courseRepository.findByIdAndUserIdAndDeletedFalse(courseId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        return courseMapper.toResponse(course);
    }

    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Course course = courseRepository.findByIdAndUserIdAndDeletedFalse(courseId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        Term term = resolveTerm(request.getTermId(), currentUser);

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setTerm(term);
        course.setColorTag(request.getColorTag());
        course.setInstructorName(request.getInstructorName());
        course.setInstructorEmail(request.getInstructorEmail());

        course = courseRepository.save(course);
        return courseMapper.toResponse(course);
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Course course = courseRepository.findByIdAndUserIdAndDeletedFalse(courseId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Soft delete — a hard delete blocks on the FK from any note that still
        // references this course, and would otherwise pull the rug out from under it.
        course.setDeleted(true);
        courseRepository.save(course);
    }

    @Transactional(readOnly = true)
    public CourseProgressResponse getCourseProgress(Long courseId) {
        User currentUser = currentUserProvider.getCurrentUser();
        Course course = courseRepository.findByIdAndUserIdAndDeletedFalse(courseId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        long completedTasks = taskRepository.countByCourseIdAndCompleted(courseId, true);
        long incompleteTasks = taskRepository.countByCourseIdAndCompleted(courseId, false);
        long totalTasks = completedTasks + incompleteTasks;

        double progressPercentage = totalTasks > 0 ? (completedTasks * 100.0) / totalTasks : 0.0;

        return CourseProgressResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .progressPercentage(Math.round(progressPercentage * 100.0) / 100.0)
                .build();
    }
}
