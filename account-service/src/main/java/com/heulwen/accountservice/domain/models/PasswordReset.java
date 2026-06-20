package com.heulwen.accountservice.domain.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "password_resets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // Used by JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)  // Used by Builder/Factory
@Builder(access = AccessLevel.PRIVATE)
public class PasswordReset {

    private static final int MAX_FAILED_ATTEMPTS = 5;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "otp_code", nullable = false)
    private String otpCode;

    @Column(name = "expiry_date", nullable = false)
    private OffsetDateTime expiryDate;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified;

    @Column(name = "failed_attempts", nullable = false)
    private Integer failedAttempts;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    // --- DDD Factory Method ---
    public static PasswordReset request(String email, String hashedOtp, OffsetDateTime expiryDate) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        if (hashedOtp == null || hashedOtp.isBlank()) {
            throw new IllegalArgumentException("OTP code cannot be empty");
        }
        if (expiryDate == null || expiryDate.isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Expiry date must be in the future");
        }

        return PasswordReset.builder()
                .email(email.trim().toLowerCase())
                .otpCode(hashedOtp)
                .expiryDate(expiryDate)
                .isVerified(false)
                .failedAttempts(0)
                .build();
    }

    // --- DDD Business Logic / Behavior ---
    public boolean verify(String rawOtp, java.util.function.BiFunction<String, String, Boolean> otpMatcher) {
        if (isExpired()) {
            throw new IllegalStateException("OTP has expired");
        }
        if (this.isVerified) {
            throw new IllegalStateException("OTP has already been verified");
        }
        if (this.failedAttempts >= MAX_FAILED_ATTEMPTS) {
            throw new IllegalStateException("Maximum verification attempts exceeded. This OTP is locked.");
        }

        boolean match = otpMatcher.apply(rawOtp, this.otpCode);
        if (match) {
            this.isVerified = true;
        } else {
            this.failedAttempts++;
        }
        return match;
    }

    public boolean isExpired() {
        return OffsetDateTime.now().isAfter(this.expiryDate);
    }

    public boolean isLocked() {
        return this.failedAttempts >= MAX_FAILED_ATTEMPTS;
    }
}
