package com.heulwen.productservice.domain.models;

import com.heulwen.productservice.domain.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // Used by JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)  // Used by Builder/Factory
@Builder(access = AccessLevel.PRIVATE)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "stock", nullable = false)
    private Integer stock;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ProductStatus status;

    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // --- DDD Factory Method ---
    public static Product create(String name, String description, BigDecimal price, Integer stock, 
                                 ProductStatus status, String imageUrl, Category category) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be empty");
        }
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        if (stock == null || stock < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }

        return Product.builder()
                .name(name.trim())
                .description(description != null ? description.trim() : null)
                .price(price)
                .stock(stock)
                .status(status != null ? status : ProductStatus.ACTIVE)
                .imageUrl(imageUrl != null ? imageUrl.trim() : null)
                .category(category)
                .build();
    }

    // --- DDD Business Logic / Behaviors ---
    public void updateDetails(String name, String description, BigDecimal price, Integer stock, 
                              ProductStatus status, String imageUrl, Category category) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be empty");
        }
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        if (stock == null || stock < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }

        this.name = name.trim();
        this.description = description != null ? description.trim() : null;
        this.price = price;
        this.stock = stock;
        this.status = status != null ? status : ProductStatus.ACTIVE;
        this.imageUrl = imageUrl != null ? imageUrl.trim() : null;
        this.category = category;
    }

    public void reduceStock(int quantity) {
        if (this.status == ProductStatus.INACTIVE) {
            throw new IllegalStateException("Product is inactive and cannot be ordered");
        }
        if (this.stock < quantity) {
            throw new IllegalArgumentException("Insufficient stock");
        }
        this.stock -= quantity;
    }

    public void restock(int quantity) {
        if (quantity < 0) {
            throw new IllegalArgumentException("Restock quantity cannot be negative");
        }
        this.stock += quantity;
    }

    public void changeStatus(ProductStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
        this.status = newStatus;
    }
}
