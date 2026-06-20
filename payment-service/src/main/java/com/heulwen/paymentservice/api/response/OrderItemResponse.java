package com.heulwen.paymentservice.api.response;

import java.math.BigDecimal;

public record OrderItemResponse(
    Long id,
    Long productId,
    String productName,
    BigDecimal price,
    Integer quantity
) {}
