package com.heulwen.productservice.service;

import com.heulwen.productservice.api.request.CategoryRequest;
import com.heulwen.productservice.api.response.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
    CategoryResponse getCategory(Long id);
    Page<CategoryResponse> getCategories(String search, Pageable pageable);
}
