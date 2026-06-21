package com.heulwen.paymentservice.controller;

import com.heulwen.paymentservice.api.request.OrderRequest;
import com.heulwen.paymentservice.api.request.OrderStatusUpdateRequest;
import com.heulwen.paymentservice.api.response.ChartDataResponse;
import com.heulwen.paymentservice.api.response.CheckoutResponse;
import com.heulwen.paymentservice.api.response.OrderResponse;
import com.heulwen.paymentservice.api.response.RevenueResponse;
import com.heulwen.paymentservice.domain.enums.OrderStatus;
import com.heulwen.paymentservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Place order / Checkout
    @PostMapping
    public ResponseEntity<CheckoutResponse> checkout(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody OrderRequest request
    ) {
        CheckoutResponse response = orderService.checkout(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Capture PayPal payment
    @PostMapping("/{id}/capture")
    public ResponseEntity<OrderResponse> captureOrder(
            @PathVariable Long id,
            @RequestParam("token") String paypalOrderId
    ) {
        OrderResponse response = orderService.captureOrder(id, paypalOrderId);
        return ResponseEntity.ok(response);
    }

    // User viewing their own orders
    @GetMapping("/my-orders")
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> response = orderService.getMyOrders(userId, pageable);
        return ResponseEntity.ok(response);
    }

    // Admin viewing all orders or filtering by status
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> response = orderService.getAllOrders(status, pageable);
        return ResponseEntity.ok(response);
    }

    // View specific order details
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(response);
    }

    // Admin updating status of an order
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody OrderStatusUpdateRequest request
    ) {
        OrderStatus status = OrderStatus.valueOf(request.status().toUpperCase());
        OrderResponse response = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(response);
    }

    // User or Admin cancelling order
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }

    // Admin statistics: general revenue metrics
    @GetMapping("/statistics/revenue")
    public ResponseEntity<RevenueResponse> getRevenueStatistics() {
        RevenueResponse response = orderService.getRevenueStatistics();
        return ResponseEntity.ok(response);
    }

    // Admin statistics: daily chart dataset
    @GetMapping("/statistics/chart")
    public ResponseEntity<List<ChartDataResponse>> getDailyRevenueChartData() {
        List<ChartDataResponse> response = orderService.getDailyRevenueChartData();
        return ResponseEntity.ok(response);
    }
}
