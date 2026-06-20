package com.heulwen.productservice.mapper;

import com.heulwen.productservice.api.request.ProductRequest;
import com.heulwen.productservice.api.response.ProductResponse;
import com.heulwen.productservice.domain.models.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product) {
        if (product == null) return null;
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getStatus(),
                product.getImageUrl(),
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    public Product toEntity(ProductRequest request) {
        if (request == null) return null;
        return Product.create(
                request.name(),
                request.description(),
                request.price(),
                request.stock(),
                request.status(),
                request.imageUrl(),
                null
        );
    }
}
