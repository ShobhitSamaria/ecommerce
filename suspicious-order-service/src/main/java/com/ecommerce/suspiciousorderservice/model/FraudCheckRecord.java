package com.ecommerce.suspiciousorderservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_check_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudCheckRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique order ID from order-service
    @Column(unique = true)
    private String orderId;

    // User ID if available
    private String userId;

    // Total monetary value of the order
    private Double orderAmount;

    // Final fraud score (0–100)
    private Integer fraudScore;

    // "SUSPICIOUS" or "NORMAL"
    private String status;

    // Comma-separated list of triggered rules
    private String reason;

    // Payment method: COD, ONLINE, CARD, etc.
    private String paymentMethod;

    // Whether billing/shipping address mismatch
    private Boolean locationMismatch;

    // Number of orders placed in short time window
    private Integer userOrderFrequency;

    // Account age in days at time of order
    private Integer accountAgeInDays;

    // Number of failed payment attempts
    private Integer failedPaymentAttempts;

    // Hour when order was placed (0-23)
    private Integer orderHour;

    // Timestamp when the check was performed
    private LocalDateTime createdAt;
}
