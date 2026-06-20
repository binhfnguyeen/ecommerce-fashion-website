package com.heulwen.accountservice.api.request;

public record ResetPasswordRequest(
    String email,
    String otpCode,
    String newPassword
) {}
