package com.heulwen.productservice.controller;

import com.heulwen.productservice.api.request.ProductRequest;
import com.heulwen.productservice.api.response.ProductResponse;
import com.heulwen.productservice.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // Public API: Lấy danh sách sản phẩm hoạt động (User/Khách hàng)
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> response = productService.getProductsForUser(search, categoryId, pageable);
        return ResponseEntity.ok(response);
    }

    // Public API: Xem chi tiết sản phẩm
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        ProductResponse response = productService.getProduct(id);
        return ResponseEntity.ok(response);
    }

    // Admin API: Xem danh sách sản phẩm quản trị (Admin)
    @GetMapping("/admin")
    public ResponseEntity<Page<ProductResponse>> getProductsForAdmin(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> response = productService.getProductsForAdmin(search, categoryId, pageable);
        return ResponseEntity.ok(response);
    }

    // Admin API: Thêm sản phẩm
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Admin API: Sửa sản phẩm
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request
    ) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    // Admin API: Xóa sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // Internal API: Lấy thông tin sản phẩm phục vụ kiểm tra đơn hàng (được gọi từ payment-service)
    @GetMapping("/internal/{id}")
    public ResponseEntity<ProductResponse> getProductInternal(@PathVariable Long id) {
        ProductResponse response = productService.getProduct(id);
        return ResponseEntity.ok(response);
    }

    // Internal API: Trừ tồn kho (được gọi từ payment-service khi checkout thành công)
    @PutMapping("/internal/{id}/reduce-stock")
    public ResponseEntity<Void> reduceStockInternal(
            @PathVariable Long id,
            @RequestParam int quantity
    ) {
        productService.reduceStock(id, quantity);
        return ResponseEntity.ok().build();
    }
}
