package com.heulwen.productservice.service;

import com.heulwen.productservice.api.request.ProductRequest;
import com.heulwen.productservice.api.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
    ProductResponse getProduct(Long id);
    Page<ProductResponse> getProductsForUser(String search, Long categoryId, Pageable pageable);
    Page<ProductResponse> getProductsForAdmin(String search, Long categoryId, Pageable pageable);
    void reduceStock(Long id, int quantity);
}
