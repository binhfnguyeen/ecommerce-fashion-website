package com.heulwen.paymentservice.repository;

import com.heulwen.paymentservice.domain.enums.OrderStatus;
import com.heulwen.paymentservice.domain.models.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items i WHERE i.productId = :productId")
    boolean existsByProductId(@Param("productId") Long productId);

    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status IN ('PAID', 'SHIPPED', 'COMPLETED')")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status IN ('PAID', 'SHIPPED', 'COMPLETED')")
    long countCompletedOrders();

    // Thống kê doanh thu theo ngày
    @Query(value = "SELECT CAST(created_at AS DATE) as date_val, SUM(total_amount) as revenue_val " +
            "FROM orders " +
            "WHERE status IN ('PAID', 'SHIPPED', 'COMPLETED') " +
            "GROUP BY CAST(created_at AS DATE) " +
            "ORDER BY date_val ASC", nativeQuery = true)
    List<Map<String, Object>> getDailyRevenueChartData();
}
