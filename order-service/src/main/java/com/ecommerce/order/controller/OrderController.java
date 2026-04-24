package com.ecommerce.order.controller;

import com.ecommerce.order.model.Order;
import com.ecommerce.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @PostMapping("/place")
    public Order placeOrder(@RequestBody Order order) {
        return orderService.saveOrder(order);
    }
    
    @GetMapping("/all")
    public java.util.List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }
    
    @GetMapping("/user/{email}")
    public java.util.List<Order> getUserOrders(@PathVariable String email) {
        return orderService.getOrdersByUserEmail(email);
    }
    
    @GetMapping("/track/{trackingId}")
    public ResponseEntity<Order> trackOrder(@PathVariable String trackingId) {
        Order order = orderService.getOrderByTrackingId(trackingId);
        if (order != null) {
            return ResponseEntity.ok(order);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody Order orderUpdate) {
        Order updatedOrder = orderService.updateOrderStatus(id, orderUpdate.getOrderStatus());
        if (updatedOrder != null) {
            return ResponseEntity.ok(updatedOrder);
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/tracking/{trackingId}/transaction")
    public ResponseEntity<Order> updateTransactionStatus(@PathVariable String trackingId, @RequestBody Order orderUpdate) {
        Order updatedOrder = orderService.updateTransactionStatus(trackingId, orderUpdate.getTransactionStatus());
        if (updatedOrder != null) {
            return ResponseEntity.ok(updatedOrder);
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/tracking/{trackingId}/status")
    public ResponseEntity<Order> updateOrderAndTransactionStatus(@PathVariable String trackingId, @RequestBody Order orderUpdate) {
        Order updatedOrder = orderService.updateOrderAndTransactionStatus(trackingId, orderUpdate.getOrderStatus(), orderUpdate.getTransactionStatus());
        if (updatedOrder != null) {
            return ResponseEntity.ok(updatedOrder);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Combined endpoint for payment confirmation.
     * Atomically updates order status + transaction status in a single DB transaction.
     * Eliminates the need for a separate frontend API call after processPayment.
     */
    @PatchMapping("/confirm-payment")
    public ResponseEntity<Order> confirmPayment(@RequestBody Map<String, String> payload) {
        String trackingId = payload.get("orderTrackingId");
        String orderStatus = payload.get("orderStatus");
        String transactionStatus = payload.get("transactionStatus");
        
        if (trackingId == null || orderStatus == null || transactionStatus == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Order updatedOrder = orderService.confirmPayment(trackingId, orderStatus, transactionStatus);
        if (updatedOrder != null) {
            return ResponseEntity.ok(updatedOrder);
        }
        return ResponseEntity.notFound().build();
    }

    // Fraud review: Admin approves a suspicious order → CONFIRMED
    @PatchMapping("/{id}/approve")
    public ResponseEntity<Order> approveFraudOrder(@PathVariable Long id) {
        Order order = orderService.approveFraudOrder(id);
        if (order != null) {
            return ResponseEntity.ok(order);
        }
        return ResponseEntity.notFound().build();
    }

    // Fraud review: Admin rejects a suspicious order → CANCELLED
    @PatchMapping("/{id}/reject")
    public ResponseEntity<Order> rejectFraudOrder(@PathVariable Long id) {
        Order order = orderService.rejectFraudOrder(id);
        if (order != null) {
            return ResponseEntity.ok(order);
        }
        return ResponseEntity.notFound().build();
    }
}
