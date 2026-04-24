package com.ecommerce.order.service;

import com.ecommerce.order.client.FraudServiceClient;
import com.ecommerce.order.dto.FraudCheckRequest;
import com.ecommerce.order.dto.FraudCheckResponse;
import com.ecommerce.order.model.Order;
import com.ecommerce.order.model.OrderItem;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.util.OrderTrackingIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderTrackingIdGenerator trackingIdGenerator;

    @Autowired
    private FraudServiceClient fraudServiceClient;

    @Autowired
    private RestTemplate restTemplate;

    private static final String USER_SERVICE_URL = "http://USER-SERVICE/api/users/account-age";
    
    @Transactional
    public Order saveOrder(Order order) {
        order.setOrderTrackingId(trackingIdGenerator.generateOrderTrackingId());
        order.setOrderStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());
        
        List<OrderItem> managedItems = new ArrayList<>();
        
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                OrderItem newItem = new OrderItem();
                newItem.setProductId(item.getProductId());
                newItem.setProductName(item.getProductName());
                newItem.setQuantity(item.getQuantity());
                newItem.setPrice(item.getPrice());
                newItem.setOrder(order);
                managedItems.add(newItem);
            }
        }
        
        order.setOrderItems(managedItems);
        
        // Save order first so we have the ID for fraud scoring
        Order savedOrder = orderRepository.save(order);
        
        // NOTE: Fraud check is now run AFTER payment confirmation, not here
        // This ensures the flow is: Select Payment → Confirm → Fraud Check
        
        return savedOrder;
    }

    // Run fraud detection AFTER payment is confirmed
    // Called from confirmPayment() after user confirms transaction
    public void runFraudCheckAfterPayment(String trackingId) {
        Order order = orderRepository.findByOrderTrackingId(trackingId).orElse(null);
        if (order != null) {
            performFraudCheck(order);
        }
    }

    // Calls fraud-service to analyze the order and updates fraud fields + order status
    private void performFraudCheck(Order order) {
        try {
            // Build fraud check request
            FraudCheckRequest request = new FraudCheckRequest();
            request.setOrderId(order.getOrderTrackingId());
            request.setUserId(order.getUserEmail());  // User identifier for fraud analysis
            request.setOrderAmount(order.getTotalAmount());
            
            // Use actual payment method from order (COD, card, upi) - default to ONLINE if not set
            String paymentMethod = order.getPaymentMethod();
            request.setPaymentMethod(paymentMethod != null ? paymentMethod : "ONLINE");

            // Count past orders from this user (frequency signal)
            int userOrderCount = orderRepository.findByUserEmail(order.getUserEmail()).size();
            request.setUserOrderFrequency(userOrderCount);

            // Location mismatch: requires frontend to pass this; defaults to false here
            // Frontend should set order.locationMismatch if billing != shipping
            request.setLocationMismatch(order.getLocationMismatch() != null ? order.getLocationMismatch() : false);


            // Fetch account age from user-service
            int accountAgeInDays = fetchAccountAge(order.getUserEmail());
            request.setAccountAgeInDays(accountAgeInDays);

            // Set order time (hour of day, 0-23)
            request.setOrderTime(order.getOrderDate().getHour());

            // Call fraud-service
            FraudCheckResponse fraudResult = fraudServiceClient.checkFraud(request);

            if (fraudResult != null) {
                // Populate fraud fields on the order
                order.setFraudScore(fraudResult.getFraudScore());
                order.setFraudReason(fraudResult.getReason());

                if ("SUSPICIOUS".equals(fraudResult.getStatus())) {
                    order.setFraudFlag(true);
                    order.setOrderStatus("PENDING_REVIEW");
                } else {
                    order.setFraudFlag(false);
                    order.setOrderStatus("CONFIRMED");
                }

                orderRepository.save(order);
            }
        } catch (Exception e) {
            // Fraud-service unavailable — fail open (allow order) but log the issue
            System.err.println("Fraud check failed: " + e.getMessage());
        }
    }

    /**
     * Calls user-service to get the account age in days for a given email.
     * Returns -1 if the user is not found or the call fails.
     */
    private int fetchAccountAge(String email) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            String url = USER_SERVICE_URL + "?email=" + email;
            var response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );


            if (response.getBody() != null && response.getBody().containsKey("accountAgeInDays")) {
                Object age = response.getBody().get("accountAgeInDays");
                if (age instanceof Number) {
                    return ((Number) age).intValue();
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch account age for " + email + ": " + e.getMessage());
        }
        return -1; // Default if lookup fails — new account signal
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public List<Order> getOrdersByUserEmail(String email) {
        return orderRepository.findByUserEmail(email);
    }
    
    public Order getOrderByTrackingId(String trackingId) {
        return orderRepository.findByOrderTrackingId(trackingId).orElse(null);
    }
    
    public Order updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null) {
            order.setOrderStatus(newStatus);
            return orderRepository.save(order);
        }
        return null;
    }

    // Admin action: approve a fraud-flagged order → CONFIRMED
    public Order approveFraudOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null) {
            order.setFraudFlag(false);
            order.setOrderStatus("CONFIRMED");
            return orderRepository.save(order);
        }
        return null;
    }

    // Admin action: reject a fraud-flagged order → CANCELLED
    public Order rejectFraudOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null) {
            order.setFraudFlag(false);
            order.setOrderStatus("CANCELLED");
            return orderRepository.save(order);
        }
        return null;
    }

    public Order updateTransactionStatus(String trackingId, String transactionStatus) {
        Order order = orderRepository.findByOrderTrackingId(trackingId).orElse(null);
        if (order != null) {
            order.setTransactionStatus(transactionStatus);
            return orderRepository.save(order);
        }
        return null;
    }

    public Order updateOrderAndTransactionStatus(String trackingId, String orderStatus, String transactionStatus) {
        Order order = orderRepository.findByOrderTrackingId(trackingId).orElse(null);
        if (order != null) {
            if (orderStatus != null) {
                order.setOrderStatus(orderStatus);
            }
            if (transactionStatus != null) {
                order.setTransactionStatus(transactionStatus);
            }
            return orderRepository.save(order);
        }
        return null;
    }

    /**
     * Optimized single-call payment confirmation.
     * Combines processPayment + updateOrderAndTransactionStatus into one atomic operation.
     * Reduces 3 sequential HTTP calls → 2 (frontend simplification).
     */
    @Transactional
    public Order confirmPayment(String trackingId, String orderStatus, String transactionStatus) {
        Order order = orderRepository.findByOrderTrackingId(trackingId).orElse(null);
        if (order != null) {
            order.setOrderStatus(orderStatus);
            order.setTransactionStatus(transactionStatus);
            Order savedOrder = orderRepository.save(order);
            
            // Run fraud check AFTER payment confirmation (Select Payment → Confirm → Fraud Check)
            runFraudCheckAfterPayment(trackingId);
            
            // Reload order to get fraud results
            return orderRepository.findByOrderTrackingId(trackingId).orElse(savedOrder);
        }
        return null;
    }
}
