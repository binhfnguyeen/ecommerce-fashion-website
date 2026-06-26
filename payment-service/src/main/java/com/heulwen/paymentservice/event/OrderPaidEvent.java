package com.heulwen.paymentservice.event;

import java.util.List;

public record OrderPaidEvent(
        Long orderId,
        String paypalOrderId,
        List<StockDeductItem> items
) {}
