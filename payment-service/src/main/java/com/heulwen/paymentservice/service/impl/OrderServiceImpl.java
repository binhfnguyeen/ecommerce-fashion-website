package com.heulwen.paymentservice.service.impl;

import com.heulwen.paymentservice.api.request.OrderItemRequest;
import com.heulwen.paymentservice.api.request.OrderRequest;
import com.heulwen.paymentservice.api.response.ChartDataResponse;
import com.heulwen.paymentservice.api.response.CheckoutResponse;
import com.heulwen.paymentservice.api.response.OrderResponse;
import com.heulwen.paymentservice.api.response.RevenueResponse;
import com.heulwen.paymentservice.domain.enums.OrderStatus;
import com.heulwen.paymentservice.domain.models.Order;
import com.heulwen.paymentservice.domain.models.OrderItem;
import com.heulwen.paymentservice.event.OrderPaidEvent;
import com.heulwen.paymentservice.event.StockDeductItem;
import com.heulwen.paymentservice.exception.AppException;
import com.heulwen.paymentservice.exception.ErrorCode;
import com.heulwen.paymentservice.mapper.OrderMapper;
import com.heulwen.paymentservice.repository.OrderRepository;
import com.heulwen.paymentservice.service.OrderService;
import com.heulwen.paymentservice.service.PayPalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final PayPalService payPalService;
    private final OrderMapper orderMapper;
    private final RestTemplate restTemplate;
    private final KafkaTemplate<String, OrderPaidEvent> kafkaTemplate;

    @Value("${product.service.url}")
    private String productServiceUrl;

    // Helper class to map incoming product response from product-service
    private record ProductDto(
            Long id,
            String name,
            BigDecimal price,
            Integer stock,
            String status
    ) {}

    @Override
    @Transactional
    public CheckoutResponse checkout(Long userId, OrderRequest request) {
        log.info("Processing checkout for user: {}", userId);
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("Order items list cannot be empty");
        }

        // 1. Tạo entity Order
        Order order = Order.create(
                userId,
                request.customerName(),
                request.customerEmail(),
                request.shippingAddress()
        );

        // 2. Kiểm tra tồn kho & trạng thái của từng sản phẩm thông qua product-service
        for (OrderItemRequest itemRequest : request.items()) {
            String productUrl = productServiceUrl + "/api/products/internal/" + itemRequest.productId();
            ProductDto product;
            try {
                ResponseEntity<ProductDto> response = restTemplate.getForEntity(productUrl, ProductDto.class);
                product = response.getBody();
            } catch (HttpClientErrorException.NotFound e) {
                throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
            } catch (Exception e) {
                log.error("Error communicating with product-service for product ID {}: {}", itemRequest.productId(), e.getMessage());
                throw new AppException(ErrorCode.PRODUCT_INACTIVE_OR_OUT_OF_STOCK);
            }

            if (product == null) {
                throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
            }

            if (!"ACTIVE".equalsIgnoreCase(product.status()) || product.stock() < itemRequest.quantity()) {
                throw new AppException(ErrorCode.PRODUCT_INACTIVE_OR_OUT_OF_STOCK);
            }

            // 3. Thêm item vào Order (Tổng số tiền sẽ tự động được cập nhật trong Order entity)
            order.addOrderItem(
                    product.id(),
                    product.name(),
                    product.price(),
                    itemRequest.quantity()
            );
        }

        // 4. Lưu đơn hàng dưới trạng thái PENDING
        Order savedOrder = orderRepository.save(order);

        // 5. Tạo PayPal Order
        Map<String, String> paypalOrderResult = payPalService.createOrder(savedOrder.getId(), savedOrder.getTotalAmount());
        String paypalOrderId = paypalOrderResult.get("paypalOrderId");
        String approveUrl = paypalOrderResult.get("approveUrl");

        if (paypalOrderId == null || approveUrl == null) {
            throw new AppException(ErrorCode.PAYPAL_CREATION_FAILED);
        }

        // Cập nhật PayPal Order ID vào đơn hàng cục bộ để theo dõi
        savedOrder.assignPaypalOrderId(paypalOrderId);
        orderRepository.save(savedOrder);

        // Trả về kết quả thanh toán cho Client
        return new CheckoutResponse(savedOrder.getId(), paypalOrderId, approveUrl);
    }

    @Override
    @Transactional
    public OrderResponse captureOrder(Long orderId, String paypalOrderId) {
        log.info("Capturing payment for local order ID: {}, PayPal Order ID: {}", orderId, paypalOrderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.COMPLETED) {
            log.info("Order {} is already in {} status. Returning existing order (idempotent capture).", orderId, order.getStatus());
            return orderMapper.toResponse(order);
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        // Kiểm tra khớp PayPal Order ID nếu có
        if (order.getPaypalOrderId() != null && !order.getPaypalOrderId().equals(paypalOrderId)) {
            log.error("Mismatch PayPal Order ID. Saved: {}, Captured request: {}", order.getPaypalOrderId(), paypalOrderId);
            throw new AppException(ErrorCode.PAYPAL_CAPTURE_FAILED);
        }


        // 1. Thực hiện capture trên PayPal
        boolean captureSuccess = payPalService.captureOrder(paypalOrderId);
        if (!captureSuccess) {
            throw new AppException(ErrorCode.PAYPAL_CAPTURE_FAILED);
        }

        // 2. Deduct stock in product-service for all items
        List<StockDeductItem> deductItems = order.getItems().stream()
                .map(item -> new StockDeductItem(item.getProductId(), item.getQuantity())).toList();

        OrderPaidEvent event = new OrderPaidEvent(order.getId(), paypalOrderId, deductItems);

        try {
            kafkaTemplate.send("order-payment-topic", String.valueOf(order.getId()), event);
            log.info("Sent OrderPaidEvent to Kafka for order ID: {}", order.getId());
        } catch (Exception e) {
            log.error("Failed to publish OrderPaidEvent to Kafka for order ID: {}", order.getId(), e);
        }

        // 3. Cập nhật trạng thái đơn hàng thành PAID
        order.markAsPaid(paypalOrderId);
        Order savedOrder = orderRepository.save(order);

        return orderMapper.toResponse(savedOrder);
    }

    @Override
    public Page<OrderResponse> getMyOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    public Page<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable) {
        if (status != null) {
            return orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                    .map(orderMapper::toResponse);
        }
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        return orderRepository.findById(id)
                .map(orderMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        order.changeStatus(status);
        Order savedOrder = orderRepository.save(order);
        return orderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional
    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        order.cancel();
        orderRepository.save(order);
    }

    @Override
    public boolean existsByProductId(Long productId) {
        return orderRepository.existsByProductId(productId);
    }

    @Override
    public RevenueResponse getRevenueStatistics() {
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        long completedOrdersCount = orderRepository.countCompletedOrders();
        return new RevenueResponse(totalRevenue, completedOrdersCount);
    }

    @Override
    public List<ChartDataResponse> getDailyRevenueChartData() {
        List<Map<String, Object>> rawData = orderRepository.getDailyRevenueChartData();
        List<ChartDataResponse> result = new ArrayList<>();
        for (Map<String, Object> map : rawData) {
            Object dateVal = map.get("date_val");
            Object revenueVal = map.get("revenue_val");

            String dateStr = dateVal != null ? dateVal.toString() : "";
            BigDecimal revenue = BigDecimal.ZERO;
            if (revenueVal instanceof BigDecimal) {
                revenue = (BigDecimal) revenueVal;
            } else if (revenueVal != null) {
                try {
                    revenue = new BigDecimal(revenueVal.toString());
                } catch (NumberFormatException e) {
                    log.error("Failed to parse revenue value: {}", revenueVal, e);
                }
            }
            result.add(new ChartDataResponse(dateStr, revenue));
        }
        return result;
    }
}
