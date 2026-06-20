package com.heulwen.paymentservice.mapper;

import com.heulwen.paymentservice.api.response.OrderItemResponse;
import com.heulwen.paymentservice.api.response.OrderResponse;
import com.heulwen.paymentservice.domain.models.Order;
import com.heulwen.paymentservice.domain.models.OrderItem;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order) {
        if (order == null) return null;

        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(this::toResponse).collect(Collectors.toList())
                : Collections.emptyList();

        return new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getShippingAddress(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getPaypalOrderId(),
                itemResponses,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    public OrderItemResponse toResponse(OrderItem item) {
        if (item == null) return null;
        return new OrderItemResponse(
                item.getId(),
                item.getProductId(),
                item.getProductName(),
                item.getPrice(),
                item.getQuantity()
        );
    }
}
