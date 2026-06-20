package com.heulwen.paymentservice.api.response;

import java.math.BigDecimal;

public record RevenueResponse(
    BigDecimal totalRevenue,
    long completedOrdersCount
) {}
