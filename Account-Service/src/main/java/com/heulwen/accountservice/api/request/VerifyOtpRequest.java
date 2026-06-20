package com.heulwen.accountservice.api.request;

public record VerifyOtpRequest(
    String email,
    String otpCode
) {}
