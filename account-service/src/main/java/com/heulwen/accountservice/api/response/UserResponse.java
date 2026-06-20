package com.heulwen.accountservice.api.response;

public record UserResponse(
    Long id,
    String username,
    String email,
    String fullName,
    String role,
    Boolean active
) {}
