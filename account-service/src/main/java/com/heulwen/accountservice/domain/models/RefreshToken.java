package com.heulwen.accountservice.domain.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "refresh_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // Used by JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)  // Used by Builder/Factory
@Builder(access = AccessLevel.PRIVATE)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token", nullable = false, unique = true)
    private String token;

    @Column(name = "expiry_date", nullable = false)
    private OffsetDateTime expiryDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "revoked", nullable = false)
    private Boolean revoked;

    // --- DDD Factory Method ---
    public static RefreshToken create(User user, String token, OffsetDateTime expiryDate) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token string cannot be empty");
        }
        if (expiryDate == null || expiryDate.isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Expiry date must be in the future");
        }

        return RefreshToken.builder()
                .user(user)
                .token(token)
                .expiryDate(expiryDate)
                .revoked(false)
                .build();
    }

    // --- DDD Business Logic / Behavior ---
    public void revoke() {
        this.revoked = true;
    }

    public boolean isExpired() {
        return OffsetDateTime.now().isAfter(this.expiryDate);
    }

    public boolean isValid() {
        return !this.revoked && !isExpired();
    }
}
