package com.heulwen.paymentservice.domain.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    // --- DDD Factory Method ---
    public static OrderItem create(Order order, Long productId, String productName, BigDecimal price, Integer quantity) {
        if (order == null) throw new IllegalArgumentException("Order must be specified");
        if (productId == null) throw new IllegalArgumentException("Product ID must be specified");
        if (productName == null || productName.trim().isEmpty()) throw new IllegalArgumentException("Product name cannot be empty");
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) throw new IllegalArgumentException("Price cannot be negative");
        if (quantity == null || quantity <= 0) throw new IllegalArgumentException("Quantity must be greater than zero");

        return OrderItem.builder()
                .order(order)
                .productId(productId)
                .productName(productName.trim())
                .price(price)
                .quantity(quantity)
                .build();
    }
}
