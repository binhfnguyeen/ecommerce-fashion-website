package com.heulwen.accountservice.api.request;

public record LoginRequest(
    String username,
    String password
) {}
