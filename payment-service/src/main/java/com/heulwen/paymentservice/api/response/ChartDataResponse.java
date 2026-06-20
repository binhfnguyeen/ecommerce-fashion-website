package com.heulwen.paymentservice.api.response;

import java.math.BigDecimal;

public record ChartDataResponse(
    String date,
    BigDecimal revenue
) {}
