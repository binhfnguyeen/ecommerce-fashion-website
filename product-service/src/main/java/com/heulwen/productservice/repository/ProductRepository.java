package com.heulwen.productservice.repository;

import com.heulwen.productservice.domain.enums.ProductStatus;
import com.heulwen.productservice.domain.models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByCategoryId(Long categoryId);
    
    // Admin Search (Allows all statuses)
    Page<Product> findByNameContainingIgnoreCaseAndCategoryId(String name, Long categoryId, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // User Search (Only ACTIVE status)
    Page<Product> findByNameContainingIgnoreCaseAndCategoryIdAndStatus(String name, Long categoryId, ProductStatus status, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseAndStatus(String name, ProductStatus status, Pageable pageable);
                             
    List<Product> findByStatus(ProductStatus status);
}
