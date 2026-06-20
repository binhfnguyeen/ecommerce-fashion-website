package com.heulwen.paymentservice.service;

import java.math.BigDecimal;
import java.util.Map;

public interface PayPalService {
    String getAccessToken();
    
    // Tạo đơn hàng trên PayPal, nhận về Map chứa "paypalOrderId" và "approveUrl"
    Map<String, String> createOrder(Long localOrderId, BigDecimal amountVnd);
    
    // Thực hiện capture (khấu trừ tiền) đơn hàng đã thanh toán
    boolean captureOrder(String paypalOrderId);
}
