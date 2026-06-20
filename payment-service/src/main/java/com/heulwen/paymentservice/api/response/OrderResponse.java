package com.heulwen.paymentservice.api.response;

import com.heulwen.paymentservice.domain.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record OrderResponse(
    Long id,
    Long userId,
    String customerName,
    String customerEmail,
    String shippingAddress,
    BigDecimal totalAmount,
    OrderStatus status,
    String paypalOrderId,
    List<OrderItemResponse> items,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
