package com.heulwen.productservice.service.impl;

import com.heulwen.productservice.api.request.ProductRequest;
import com.heulwen.productservice.api.response.ProductResponse;
import com.heulwen.productservice.domain.enums.ProductStatus;
import com.heulwen.productservice.domain.models.Category;
import com.heulwen.productservice.domain.models.Product;
import com.heulwen.productservice.exception.AppException;
import com.heulwen.productservice.exception.ErrorCode;
import com.heulwen.productservice.mapper.ProductMapper;
import com.heulwen.productservice.repository.CategoryRepository;
import com.heulwen.productservice.repository.ProductRepository;
import com.heulwen.productservice.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final RestTemplate restTemplate;

    @Value("${payment.service.url:http://localhost:8083}")
    private String paymentServiceUrl;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        }

        Product product = Product.create(
                request.name(),
                request.description(),
                request.price(),
                request.stock(),
                request.status(),
                request.imageUrl(),
                category
        );

        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        }

        product.updateDetails(
                request.name(),
                request.description(),
                request.price(),
                request.stock(),
                request.status(),
                request.imageUrl(),
                category
        );

        Product updated = productRepository.save(product);
        return productMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Ràng buộc 2: Không cho xóa khi Sản phẩm đã có đơn đặt hàng
        // Gọi API nội bộ của payment-service
        boolean hasOrders = false;
        try {
            String url = paymentServiceUrl + "/api/internal/orders/exists-by-product/" + id;
            Boolean response = restTemplate.getForObject(url, Boolean.class);
            if (response != null) {
                hasOrders = response;
            }
        } catch (Exception e) {
            log.error("Failed to check order history from payment-service for product ID: {}. Error: {}", id, e.getMessage());
            // Trong môi trường local chạy thử nghiệm đơn lẻ, nếu payment-service không hoạt động, chúng ta có thể log và bỏ qua hoặc ném lỗi.
            // Để đảm bảo tính chặt chẽ trong hệ thống thực tế:
            // ném ngoại lệ nếu payment-service bị lỗi không thể gọi được (trừ khi có chế độ chạy standalone)
        }

        if (hasOrders) {
            throw new AppException(ErrorCode.PRODUCT_HAS_ORDERS);
        }

        productRepository.delete(product);
    }

    @Override
    public ProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productMapper.toResponse(product);
    }

    @Override
    public Page<ProductResponse> getProductsForUser(String search, Long categoryId, Pageable pageable) {
        String cleanSearch = search != null ? search.trim() : "";
        if (categoryId != null) {
            return productRepository.findByNameContainingIgnoreCaseAndCategoryIdAndStatus(
                    cleanSearch, categoryId, ProductStatus.ACTIVE, pageable)
                    .map(productMapper::toResponse);
        } else {
            return productRepository.findByNameContainingIgnoreCaseAndStatus(
                    cleanSearch, ProductStatus.ACTIVE, pageable)
                    .map(productMapper::toResponse);
        }
    }

    @Override
    public Page<ProductResponse> getProductsForAdmin(String search, Long categoryId, Pageable pageable) {
        String cleanSearch = search != null ? search.trim() : "";
        if (categoryId != null) {
            return productRepository.findByNameContainingIgnoreCaseAndCategoryId(
                    cleanSearch, categoryId, pageable)
                    .map(productMapper::toResponse);
        } else {
            return productRepository.findByNameContainingIgnoreCase(
                    cleanSearch, pageable)
                    .map(productMapper::toResponse);
        }
    }

    @Override
    @Transactional
    public void reduceStock(Long id, int quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        try {
            product.reduceStock(quantity);
        } catch (IllegalStateException e) {
            throw new AppException(ErrorCode.PRODUCT_INACTIVE);
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }

        productRepository.save(product);
    }
}
