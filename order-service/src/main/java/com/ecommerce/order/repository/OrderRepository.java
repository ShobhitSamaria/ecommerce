package com.ecommerce.order.repository;

import com.ecommerce.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Order Repository - Data Access Layer
 * 
 * Provides CRUD operations for Order entity
 * 
 * @author Student
 * @since 2024
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Find order by unique tracking ID
     */
    Optional<Order> findByOrderTrackingId(String orderTrackingId);
    
    /**
     * Find all orders by user email (order history)
     */
    List<Order> findByUserEmail(String userEmail);
    
    /**
     * Check if tracking ID already exists
     */
    boolean existsByOrderTrackingId(String orderTrackingId);
}
