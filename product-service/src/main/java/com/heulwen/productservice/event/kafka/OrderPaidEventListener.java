package com.heulwen.productservice.event.kafka;

import com.heulwen.productservice.event.OrderPaidEvent;
import com.heulwen.productservice.event.StockDeductItem;
import com.heulwen.productservice.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderPaidEventListener {

    private final ProductService productService;

    @KafkaListener(topics = "order-payment-topic", groupId = "product-service-group")
    public void handleOrderPaidEvent(OrderPaidEvent event){
        log.info("Received OrderPaidEvent for Order ID: {} with {} items", event.orderId(), event.items().size());

        for (StockDeductItem item: event.items()) {
            try {
                productService.reduceStock(item.productId(), item.quantity());
                log.info("Successfully reduced stock for Product ID: {} by quantity: {}", item.productId(), item.quantity());
            } catch (Exception e) {
                log.error("CRITICAL: Failed to deduct stock for Product ID: {} under Order ID: {}. Error: {}",
                        item.productId(), event.orderId(), e.getMessage());
            }
        }
    }
}
