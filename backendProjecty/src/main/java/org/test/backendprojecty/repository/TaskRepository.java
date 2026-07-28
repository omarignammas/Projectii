package org.test.backendprojecty.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.test.backendprojecty.entity.Task;

import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Page<Task> findByUserId(Long userId, Pageable pageable);
    Page<Task> findByUserIdAndCourseId(Long userId, Long courseId, Pageable pageable);
    Optional<Task> findByIdAndUserId(Long id, Long userId);
    long countByCourseIdAndCompleted(Long courseId, boolean completed);
    boolean existsByTitleAndUserId(String title, Long userId);
}
