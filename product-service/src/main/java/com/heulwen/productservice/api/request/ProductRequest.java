package com.heulwen.productservice.api.request;

import com.heulwen.productservice.domain.enums.ProductStatus;
import java.math.BigDecimal;

public record ProductRequest(
    String name,
    String description,
    BigDecimal price,
    Integer stock,
    ProductStatus status,
    String imageUrl,
    Long categoryId
) {}
