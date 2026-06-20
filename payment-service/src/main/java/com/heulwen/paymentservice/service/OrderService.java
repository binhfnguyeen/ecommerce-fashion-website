package com.heulwen.paymentservice.service;

import com.heulwen.paymentservice.api.request.OrderRequest;
import com.heulwen.paymentservice.api.response.ChartDataResponse;
import com.heulwen.paymentservice.api.response.CheckoutResponse;
import com.heulwen.paymentservice.api.response.OrderResponse;
import com.heulwen.paymentservice.api.response.RevenueResponse;
import com.heulwen.paymentservice.domain.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {

    CheckoutResponse checkout(Long userId, OrderRequest request);

    OrderResponse captureOrder(Long orderId, String paypalOrderId);

    Page<OrderResponse> getMyOrders(Long userId, Pageable pageable);

    Page<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable);

    OrderResponse getOrderById(Long id);

    OrderResponse updateOrderStatus(Long id, OrderStatus status);

    void cancelOrder(Long id);

    boolean existsByProductId(Long productId);

    RevenueResponse getRevenueStatistics();

    List<ChartDataResponse> getDailyRevenueChartData();
}
