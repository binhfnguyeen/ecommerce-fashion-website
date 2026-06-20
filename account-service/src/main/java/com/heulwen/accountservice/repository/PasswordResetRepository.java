package com.heulwen.accountservice.repository;

import com.heulwen.accountservice.domain.models.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    Optional<PasswordReset> findFirstByEmailOrderByCreatedAtDesc(String email);
}
