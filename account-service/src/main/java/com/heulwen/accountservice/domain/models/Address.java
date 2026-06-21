package com.heulwen.accountservice.domain.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "addresses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // Used by JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)  // Used by Builder/Factory
@Builder(access = AccessLevel.PRIVATE)
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "address_name", nullable = false, length = 100)
    private String addressName;

    @Column(name = "address_line", nullable = false, length = 255)
    private String addressLine;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public static Address create(Long userId, String addressName, String addressLine, String phone, Boolean isDefault) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (addressName == null || addressName.isBlank()) {
            throw new IllegalArgumentException("Address name cannot be empty");
        }
        if (addressLine == null || addressLine.isBlank()) {
            throw new IllegalArgumentException("Address line cannot be empty");
        }
        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("Phone number cannot be empty");
        }

        return Address.builder()
                .userId(userId)
                .addressName(addressName.trim())
                .addressLine(addressLine.trim())
                .phone(phone.trim())
                .isDefault(isDefault != null ? isDefault : false)
                .build();
    }

    public void update(String addressName, String addressLine, String phone, Boolean isDefault) {
        if (addressName != null && !addressName.isBlank()) {
            this.addressName = addressName.trim();
        }
        if (addressLine != null && !addressLine.isBlank()) {
            this.addressLine = addressLine.trim();
        }
        if (phone != null && !phone.isBlank()) {
            this.phone = phone.trim();
        }
        if (isDefault != null) {
            this.isDefault = isDefault;
        }
    }

    public void setDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
}
