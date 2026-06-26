package com.heulwen.productservice.event;

public record StockDeductItem(
    Long productId,
    int quantity
) {}
