package com.heulwen.paymentservice.domain.models;

import com.heulwen.paymentservice.domain.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // Used by JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)  // Used by Builder/Factory
@Builder(access = AccessLevel.PRIVATE)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "customer_email", nullable = false, length = 100)
    private String customerEmail;

    @Column(name = "shipping_address", nullable = false, length = 255)
    private String shippingAddress;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderStatus status;

    @Column(name = "paypal_order_id", length = 100)
    private String paypalOrderId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // --- DDD Factory Method ---
    public static Order create(Long userId, String customerName, String customerEmail, String shippingAddress) {
        if (userId == null) throw new IllegalArgumentException("User ID must be specified");
        if (customerName == null || customerName.trim().isEmpty()) throw new IllegalArgumentException("Customer name cannot be empty");
        if (customerEmail == null || customerEmail.trim().isEmpty()) throw new IllegalArgumentException("Customer email cannot be empty");
        if (shippingAddress == null || shippingAddress.trim().isEmpty()) throw new IllegalArgumentException("Shipping address cannot be empty");

        return Order.builder()
                .userId(userId)
                .customerName(customerName.trim())
                .customerEmail(customerEmail.trim())
                .shippingAddress(shippingAddress.trim())
                .totalAmount(BigDecimal.ZERO)
                .status(OrderStatus.PENDING)
                .items(new ArrayList<>())
                .build();
    }

    // --- DDD Business Logic / Behaviors ---
    public void addOrderItem(Long productId, String productName, BigDecimal price, Integer quantity) {
        OrderItem item = OrderItem.create(this, productId, productName, price, quantity);
        this.items.add(item);
        
        // Cập nhật lại tổng số tiền
        BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(quantity));
        this.totalAmount = this.totalAmount.add(itemTotal);
    }

    public void markAsPaid(String paypalOrderId) {
        if (this.status != OrderStatus.PENDING) {
            throw new IllegalStateException("Only PENDING orders can be marked as PAID");
        }
        if (paypalOrderId == null || paypalOrderId.trim().isEmpty()) {
            throw new IllegalArgumentException("PayPal Order ID cannot be empty");
        }
        this.status = OrderStatus.PAID;
        this.paypalOrderId = paypalOrderId.trim();
    }

    public void assignPaypalOrderId(String paypalOrderId) {
        if (paypalOrderId == null || paypalOrderId.trim().isEmpty()) {
            throw new IllegalArgumentException("PayPal Order ID cannot be empty");
        }
        this.paypalOrderId = paypalOrderId.trim();
    }


    public void changeStatus(OrderStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
        
        // Ràng buộc quy trình trạng thái (Workflow)
        if (this.status == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot change status of a CANCELLED order");
        }
        if (this.status == OrderStatus.COMPLETED) {
            throw new IllegalStateException("Cannot change status of a COMPLETED order");
        }
        
        this.status = newStatus;
    }

    public void cancel() {
        if (this.status == OrderStatus.SHIPPED || this.status == OrderStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel an order that has been SHIPPED or COMPLETED");
        }
        this.status = OrderStatus.CANCELLED;
    }
}
