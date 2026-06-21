package com.heulwen.accountservice.api.response;

import java.time.OffsetDateTime;

public record AddressResponse(
    Long id,
    Long userId,
    String addressName,
    String addressLine,
    String phone,
    Boolean isDefault,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
