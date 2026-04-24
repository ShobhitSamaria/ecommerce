package com.ecommerce.order.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FraudCheckResponse {

    private String orderId;
    private String status;
    private Integer fraudScore;
    private String reason;
}
