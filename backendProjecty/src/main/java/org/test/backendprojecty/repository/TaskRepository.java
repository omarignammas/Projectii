package org.test.backendprojecty.repository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.test.backendprojecty.entity.Task;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Page<Task> findByProjectId(Long projectId, Pageable pageable);
    Optional<Task> findByIdAndProjectId(Long id, Long projectId);
    long countByProjectIdAndCompleted(Long projectId, boolean completed);
    boolean existsByTitleAndProject_Id(String title, Long projectId);

    void findByProjectId(long l);
}
