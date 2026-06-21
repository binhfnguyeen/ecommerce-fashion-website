package com.heulwen.accountservice.api.request;

import com.heulwen.accountservice.domain.enums.UserRole;

public record AdminCreateUserRequest(
    String username,
    String password,
    String email,
    String fullName,
    UserRole role
) {}
