package com.heulwen.accountservice.api.request;

import com.heulwen.accountservice.domain.enums.UserRole;

public record AdminUpdateUserRequest(
    String email,
    String fullName,
    UserRole role
) {}
