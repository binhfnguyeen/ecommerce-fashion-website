package com.heulwen.accountservice.api.request;

public record RegisterRequest(
    String username,
    String password,
    String email,
    String fullName
) {}
