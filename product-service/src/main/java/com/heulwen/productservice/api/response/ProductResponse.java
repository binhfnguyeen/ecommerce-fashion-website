package com.heulwen.productservice.api.response;

import com.heulwen.productservice.domain.enums.ProductStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ProductResponse(
    Long id,
    String name,
    String description,
    BigDecimal price,
    Integer stock,
    ProductStatus status,
    String imageUrl,
    Long categoryId,
    String categoryName,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
