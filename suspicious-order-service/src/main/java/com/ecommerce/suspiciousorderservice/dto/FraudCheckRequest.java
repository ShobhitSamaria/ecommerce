package com.ecommerce.suspiciousorderservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudCheckRequest {

    // Unique order identifier from order-service
    private String orderId;

    // User ID who placed the order
    private String userId;

    // Total monetary value of the order
    private Double orderAmount;

    // Number of orders placed by this user in a short time window
    private Integer userOrderFrequency;

    // Whether billing address differs from shipping address
    private Boolean locationMismatch;

    // Payment mode: COD (Cash on Delivery) or ONLINE
    private String paymentMethod;

    // Age of the user account in days (0 = created today)
    private Integer accountAgeInDays;

    // Number of failed payment attempts before this order
    private Integer failedPaymentAttempts;

    // Hour of the day the order was placed (0–23), e.g. 14 = 2 PM
    private Integer orderTime;
}
