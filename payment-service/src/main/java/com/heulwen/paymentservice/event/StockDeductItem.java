package com.heulwen.paymentservice.event;

public record StockDeductItem(
   Long productId,
   int quantity
) {}
