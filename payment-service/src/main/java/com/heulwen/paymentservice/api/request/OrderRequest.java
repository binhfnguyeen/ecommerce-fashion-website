package com.heulwen.paymentservice.api.request;

import java.util.List;

public record OrderRequest(
    String customerName,
    String customerEmail,
    String shippingAddress,
    List<OrderItemRequest> items
) {}
