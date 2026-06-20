package com.heulwen.productservice.mapper;

import com.heulwen.productservice.api.request.CategoryRequest;
import com.heulwen.productservice.api.response.CategoryResponse;
import com.heulwen.productservice.domain.models.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        if (category == null) return null;
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

    public Category toEntity(CategoryRequest request) {
        if (request == null) return null;
        return Category.create(request.name(), request.description());
    }
}
