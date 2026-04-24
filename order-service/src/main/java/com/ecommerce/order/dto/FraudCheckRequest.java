package com.ecommerce.order.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FraudCheckRequest {

    private String orderId;
    private Double orderAmount;
    private Integer userOrderFrequency;
    private Boolean locationMismatch;
    private String paymentMethod;
    private Integer accountAgeInDays;
    private Integer failedPaymentAttempts;
    private Integer orderTime;
}
