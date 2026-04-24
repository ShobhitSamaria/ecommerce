package com.ecommerce.order.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String orderTrackingId;
    private String userEmail;
    private String fullName;
    private String address;
    private String city;
    private String zipCode;
    private Double totalAmount;
    private String orderStatus;
    private String transactionStatus;
    private LocalDateTime orderDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<OrderItem> orderItems = new ArrayList<>();

    // Fraud detection fields (populated by fraud-service on order placement)
    private Boolean fraudFlag = false;
    private Integer fraudScore = 0;
    private String fraudReason;

    // Whether billing address differs from shipping address (set at checkout)
    private Boolean locationMismatch = false;
    
    // Payment method selected by user (COD, CARD, UPI)
    private String paymentMethod;

    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
        item.setOrder(this);
    }
}
