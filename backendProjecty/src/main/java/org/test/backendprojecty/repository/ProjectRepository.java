package org.test.backendprojecty.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.test.backendprojecty.entity.Project;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByIdAndUserId(Long id, Long userId);
    Page<Project> findByUserId(Long userId, Pageable pageable);
    boolean existsByTitleAndUserId(String title, Long userId);

    void findByUserId(long l);
}
