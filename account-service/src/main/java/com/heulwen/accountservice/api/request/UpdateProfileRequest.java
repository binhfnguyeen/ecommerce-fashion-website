package com.heulwen.accountservice.api.request;

public record UpdateProfileRequest(
    String fullName,
    String email,
    String currentPassword,
    String newPassword
) {}
