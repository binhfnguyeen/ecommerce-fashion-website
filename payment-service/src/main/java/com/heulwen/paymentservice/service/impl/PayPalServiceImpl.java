package com.heulwen.paymentservice.service.impl;

import com.heulwen.paymentservice.service.PayPalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayPalServiceImpl implements PayPalService {

    private final RestTemplate restTemplate;

    @Value("${paypal.client.id}")
    private String clientId;

    @Value("${paypal.client.secret}")
    private String clientSecret;

    @Value("${paypal.mode:sandbox}")
    private String mode;

    @Value("${paypal.exchange-rate:25000.0}")
    private BigDecimal exchangeRate;

    private String getBaseUrl() {
        return "live".equalsIgnoreCase(mode) 
                ? "https://api-m.paypal.com" 
                : "https://api-m.sandbox.paypal.com";
    }

    @Override
    public String getAccessToken() {
        try {
            String url = getBaseUrl() + "/v1/oauth2/token";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(clientId, clientSecret);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
            throw new RuntimeException("Failed to get PayPal access token. Response status: " + response.getStatusCode());
        } catch (Exception e) {
            log.error("Error obtaining PayPal access token: {}", e.getMessage());
            throw new RuntimeException("PayPal Auth Error: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, String> createOrder(Long localOrderId, BigDecimal amountVnd) {
        try {
            String accessToken = getAccessToken();
            String url = getBaseUrl() + "/v2/checkout/orders";

            BigDecimal usdAmount = amountVnd.divide(exchangeRate, 2, RoundingMode.HALF_UP);
            log.info("Creating PayPal order for local order ID: {}, VND amount: {} -> USD amount: {}", localOrderId, amountVnd, usdAmount);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            // Xây dựng request body bằng Map để tránh lỗi cấu trúc phức tạp
            Map<String, Object> body = new HashMap<>();
            body.put("intent", "CAPTURE");

            Map<String, Object> purchaseUnit = new HashMap<>();
            purchaseUnit.put("reference_id", localOrderId.toString());

            Map<String, String> amountMap = new HashMap<>();
            amountMap.put("currency_code", "USD");
            amountMap.put("value", usdAmount.toString());
            purchaseUnit.put("amount", amountMap);

            body.put("purchase_units", Collections.singletonList(purchaseUnit));

            Map<String, Object> applicationContext = new HashMap<>();
            applicationContext.put("brand_name", "Ecommerce Fashion Store");
            applicationContext.put("user_action", "PAY_NOW");
            applicationContext.put("return_url", "http://localhost:3000/order-success?orderId=" + localOrderId);
            applicationContext.put("cancel_url", "http://localhost:3000/order-cancel?orderId=" + localOrderId);
            body.put("application_context", applicationContext);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null) {
                Map<String, String> result = new HashMap<>();
                String paypalOrderId = (String) response.getBody().get("id");
                result.put("paypalOrderId", paypalOrderId);

                List<Map<String, Object>> links = (List<Map<String, Object>>) response.getBody().get("links");
                String approveUrl = "";
                if (links != null) {
                    for (Map<String, Object> link : links) {
                        if ("approve".equals(link.get("rel"))) {
                            approveUrl = (String) link.get("href");
                            break;
                        }
                    }
                }
                result.put("approveUrl", approveUrl);
                log.info("PayPal order created successfully. ID: {}, Approve URL: {}", paypalOrderId, approveUrl);
                return result;
            }
            throw new RuntimeException("Failed to create PayPal order. Status: " + response.getStatusCode());
        } catch (Exception e) {
            log.error("Error creating PayPal order: {}", e.getMessage());
            throw new RuntimeException("PayPal Order Creation Error: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean captureOrder(String paypalOrderId) {
        try {
            String accessToken = getAccessToken();
            String url = getBaseUrl() + "/v2/checkout/orders/" + paypalOrderId + "/capture";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            HttpEntity<String> request = new HttpEntity<>("{}", headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.CREATED || response.getStatusCode() == HttpStatus.OK) {
                if (response.getBody() != null) {
                    String status = (String) response.getBody().get("status");
                    log.info("PayPal capture status for order {}: {}", paypalOrderId, status);
                    return "COMPLETED".equalsIgnoreCase(status);
                }
            }
            return false;
        } catch (Exception e) {
            log.error("Error capturing PayPal order: {}", e.getMessage());
            return false;
        }
    }
}
