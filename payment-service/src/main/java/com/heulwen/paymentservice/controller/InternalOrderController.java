package com.heulwen.paymentservice.controller;

import com.heulwen.paymentservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/orders")
@RequiredArgsConstructor
public class InternalOrderController {

    private final OrderService orderService;

    // Check if a product is part of any orders
    @GetMapping("/exists-by-product/{productId}")
    public ResponseEntity<Boolean> existsByProductId(@PathVariable Long productId) {
        boolean exists = orderService.existsByProductId(productId);
        return ResponseEntity.ok(exists);
    }
}
