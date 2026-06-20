package com.heulwen.productservice.service.impl;

import com.heulwen.productservice.api.request.CategoryRequest;
import com.heulwen.productservice.api.response.CategoryResponse;
import com.heulwen.productservice.domain.models.Category;
import com.heulwen.productservice.exception.AppException;
import com.heulwen.productservice.exception.ErrorCode;
import com.heulwen.productservice.mapper.CategoryMapper;
import com.heulwen.productservice.repository.CategoryRepository;
import com.heulwen.productservice.repository.ProductRepository;
import com.heulwen.productservice.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.name())) {
            throw new AppException(ErrorCode.CATEGORY_NAME_EXISTED);
        }
        Category category = categoryMapper.toEntity(request);
        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (categoryRepository.existsByNameAndIdNot(request.name(), id)) {
            throw new AppException(ErrorCode.CATEGORY_NAME_EXISTED);
        }

        category.update(request.name(), request.description());

        Category updated = categoryRepository.save(category);
        return categoryMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Ràng buộc 1: Không cho xóa khi Danh mục Sản phẩm đã có sản phẩm thuộc Danh mục này
        if (productRepository.existsByCategoryId(id)) {
            throw new AppException(ErrorCode.CATEGORY_HAS_PRODUCTS);
        }

        categoryRepository.delete(category);
    }

    @Override
    public CategoryResponse getCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return categoryMapper.toResponse(category);
    }

    @Override
    public Page<CategoryResponse> getCategories(String search, Pageable pageable) {
        if (search == null || search.trim().isEmpty()) {
            return categoryRepository.findAll(pageable)
                    .map(categoryMapper::toResponse);
        }
        return categoryRepository.findByNameContainingIgnoreCase(search.trim(), pageable)
                .map(categoryMapper::toResponse);
    }
}
