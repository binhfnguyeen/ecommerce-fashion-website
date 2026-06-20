package com.heulwen.accountservice.api.request;

public record TokenRefreshRequest(
    String refreshToken
) {}
