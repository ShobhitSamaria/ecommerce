package com.ecommerce.paymentservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments", indexes = {
    @Index(name = "idx_order_tracking_id", columnList = "order_tracking_id"),
    @Index(name = "idx_payment_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_tracking_id")
    private String orderTrackingId;

    private Double amount;

    @Column(name = "payment_mode")
    private String paymentMode;

    private String status;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "payment_time")
    private LocalDateTime paymentTime;
}
