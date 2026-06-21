package com.heulwen.accountservice.api.request;

public record AddressRequest(
    String addressName,
    String addressLine,
    String phone,
    Boolean isDefault
) {}
