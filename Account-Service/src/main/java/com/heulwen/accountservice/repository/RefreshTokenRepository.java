package com.heulwen.accountservice.repository;

import com.heulwen.accountservice.domain.models.RefreshToken;
import com.heulwen.accountservice.domain.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);
}
