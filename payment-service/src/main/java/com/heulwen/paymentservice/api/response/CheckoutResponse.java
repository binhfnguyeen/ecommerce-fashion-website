package com.heulwen.paymentservice.api.response;

public record CheckoutResponse(
    Long orderId,
    String paypalOrderId,
    String approveUrl
) {}
