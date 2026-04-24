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

    // Final fraud score (0–100)
    private Integer fraudScore;

    // "SUSPICIOUS" or "NORMAL"
    private String status;

    // Comma-separated list of triggered rules
    private String reason;

    // Timestamp when the check was performed
    private LocalDateTime checkedAt;
}
