package org.test.backendprojecty.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.test.backendprojecty.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // "Deleting" a user from the admin panel just disables the account (same field
    // Spring Security's UserDetails.isEnabled() already checks) — a hard delete would
    // hit FK constraints from tasks, notes, notifications, friend requests, and focus
    // room participation, none of which cascade from User.
    Page<User> findByEnabledTrue(Pageable pageable);
    long countByEnabledTrue();
    long countByEnabledTrueAndCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<User> findByEnabledTrueAndCreatedAtAfterOrderByCreatedAtAsc(LocalDateTime cutoff);
}
