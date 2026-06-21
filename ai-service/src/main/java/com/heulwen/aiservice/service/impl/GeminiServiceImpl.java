package com.heulwen.aiservice.service.impl;

import com.heulwen.aiservice.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiServiceImpl implements GeminiService {

    private final RestTemplate restTemplate;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${product.service.url}")
    private String productServiceUrl;

    // Helper records to map products from product-service
    private record ProductDto(
            Long id,
            String name,
            String description,
            BigDecimal price,
            Integer stock,
            String status
    ) {}

    private record PageResponse(
            List<ProductDto> content
    ) {}

    @Override
    public String generateChatResponse(String message) {
        log.info("Generating chat response for message: '{}'", message);

        // 1. Kiểm tra API Key, nếu rỗng thì chuyển ngay về Mock Offline
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.startsWith("YOUR_")) {
            log.warn("Gemini API Key is not configured or placeholder. Falling back to offline mock mode.");
            return getMockResponse(message);
        }

        // 2. Lấy danh sách sản phẩm từ product-service làm ngữ cảnh (Context)
        String productContext = fetchProductCatalogContext();

        // 3. Xây dựng System Prompt chèn thông tin cửa hàng
        String systemInstruction = "Bạn là trợ lý ảo hỗ trợ khách hàng thông minh của cửa hàng thời trang 'Ecommerce Fashion Store'. " +
                "Nhiệm vụ của bạn là hỗ trợ tư vấn sản phẩm, giải đáp chính sách bán hàng của cửa hàng một cách lịch sự, thân thiện và ngắn gọn. " +
                "\n\n--- CHÍNH SÁCH CỬA HÀNG ---\n" +
                "- Chính sách đổi trả: Hỗ trợ đổi trả hoặc hoàn tiền trong vòng 7 ngày kể từ khi nhận hàng. Điều kiện sản phẩm phải còn nguyên tem mác, chưa qua sử dụng và không bị hư hỏng.\n" +
                "- Chính sách giao hàng: Miễn phí vận chuyển cho đơn hàng từ 500,000 VND trở lên.\n\n" +
                "--- DANH SÁCH SẢN PHẨM HIỆN CÓ TẠI CỬA HÀNG ---\n" +
                productContext + "\n\n" +
                "Hãy trả lời câu hỏi sau của khách hàng dựa trên thông tin trên:";

        String fullPrompt = systemInstruction + "\n\nKhách hàng: " + message + "\nTrợ lý ảo:";

        // 4. Gửi yêu cầu sang Google Gemini API
        try {
            String url = geminiApiUrl + "?key=" + geminiApiKey;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of(
                                    "parts", List.of(
                                            Map.of("text", fullPrompt)
                                    )
                            )
                    )
            );

            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestBody, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map body = response.getBody();
                List candidates = (List) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    if (content != null) {
                        List parts = (List) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map part = (Map) parts.get(0);
                            String text = (String) part.get("text");
                            log.info("Gemini API call succeeded.");
                            return text;
                        }
                    }
                }
            }
            log.warn("Gemini API response was invalid. Falling back to mock response.");
            return getMockResponse(message);
        } catch (Exception e) {
            log.error("Failed to call Gemini API. Error: {}. Falling back to offline mock mode.", e.getMessage());
            return getMockResponse(message);
        }
    }

    private String fetchProductCatalogContext() {
        try {
            String url = productServiceUrl + "/api/products?size=20";
            ResponseEntity<PageResponse> response = restTemplate.getForEntity(url, PageResponse.class);
            PageResponse page = response.getBody();
            if (page != null && page.content() != null && !page.content().isEmpty()) {
                StringBuilder builder = new StringBuilder();
                for (ProductDto p : page.content()) {
                    if ("ACTIVE".equalsIgnoreCase(p.status())) {
                        builder.append(String.format("- ID %d: %s - Giá: %,.0f VND - Mô tả: %s (Tồn kho: %d)\n",
                                p.id(), p.name(), p.price().doubleValue(), p.description(), p.stock()));
                    }
                }
                return builder.toString();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch product catalog from product-service: {}. Proceeding without products context.", e.getMessage());
        }
        return "(Hiện tại không lấy được danh sách sản phẩm thời gian thực, bạn vui lòng tự giới thiệu các mẫu thời trang phổ biến như Áo thun Polo, Sơ mi Oxford, Quần Jean Slimfit...)";
    }

    private String getMockResponse(String userMessage) {
        String msg = userMessage.toLowerCase();
        if (msg.contains("đổi") || msg.contains("trả") || msg.contains("hoàn tiền")) {
            return "Chào bạn! Chính sách đổi trả của cửa hàng Ecommerce Fashion Store như sau:\n" +
                   "- Hỗ trợ đổi trả sản phẩm trong vòng 7 ngày kể từ khi bạn nhận được hàng.\n" +
                   "- Điều kiện: Sản phẩm phải còn nguyên tem mác, chưa qua giặt là/sử dụng và không bị hư hỏng.\n" +
                   "Bạn vui lòng mang sản phẩm đến cửa hàng gần nhất hoặc liên hệ hotline chăm sóc khách hàng để được hướng dẫn chi tiết nhé!";
        } else if (msg.contains("sản phẩm") || msg.contains("áo") || msg.contains("quần") || msg.contains("mua") || msg.contains("tư vấn")) {
            return "Chào bạn! Hiện tại cửa hàng chúng tôi đang có sẵn rất nhiều sản phẩm thời trang cao cấp như:\n" +
                   "- Áo thun Polo Cotton thoáng mát.\n" +
                   "- Áo sơ mi Oxford lịch lãm.\n" +
                   "- Quần Jean Slimfit trẻ trung năng động.\n" +
                   "Bạn có thể xem chi tiết sản phẩm trên trang chủ hoặc nhắn tên sản phẩm cụ thể để mình hỗ trợ thêm nhé!";
        } else {
            return "Chào bạn! Mình là trợ lý ảo của Ecommerce Fashion Store. Hiện tại mình đang chạy ở chế độ thử nghiệm (Offline Mock).\n" +
                   "Nếu bạn cần tư vấn sản phẩm hoặc chính sách đổi trả hàng, hãy đặt câu hỏi cho mình nhé!";
        }
    }
}
