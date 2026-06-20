package com.heulwen.paymentservice.api.request;

public record OrderItemRequest(
    Long productId,
    Integer quantity
) {}
