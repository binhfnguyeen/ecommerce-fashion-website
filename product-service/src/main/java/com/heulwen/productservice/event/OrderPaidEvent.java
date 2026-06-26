package com.heulwen.productservice.event;

import java.util.List;

public record OrderPaidEvent(
    Long orderId,
    String paypalOrderId,
    List<StockDeductItem> items
) {}
