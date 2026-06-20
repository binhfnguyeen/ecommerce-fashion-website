package com.heulwen.accountservice.api.response;

public record TokenResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    String username,
    String email,
    String role
) {}
