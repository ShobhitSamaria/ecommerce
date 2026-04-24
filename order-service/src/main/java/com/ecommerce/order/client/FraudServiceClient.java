package com.ecommerce.order.client;

import com.ecommerce.order.dto.FraudCheckRequest;
import com.ecommerce.order.dto.FraudCheckResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.CompletableFuture;

/**
 * Client to communicate with the suspicious-order-service microservice.
 * Uses Eureka service discovery — app name 'SUSPICIOUS-ORDER-SERVICE' resolves to the suspicious-order-service instance.
 */
@Component
public class FraudServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    // Eureka service name — resolves to suspicious-order-service's network address via Eureka
    private static final String FRAUD_SERVICE_URL = "http://SUSPICIOUS-ORDER-SERVICE/api/fraud/check";

    /**
     * Synchronous fraud check — blocks until response is received.
     * Used when order placement must wait for fraud result before returning.
     */
    public FraudCheckResponse checkFraud(FraudCheckRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<FraudCheckRequest> entity = new HttpEntity<>(request, headers);

        // Call suspicious-order-service via Eureka-routed URL
        ResponseEntity<FraudCheckResponse> response = restTemplate.exchange(
                FRAUD_SERVICE_URL,
                HttpMethod.POST,
                entity,
                FraudCheckResponse.class
        );

        return response.getBody();
    }

    /**
     * Asynchronous non-blocking fraud check — returns immediately.
     * The fraud result is processed in the background without slowing down the payment flow.
     * Recommended for payment checkout where speed is critical.
     */
    @Async("fraudCheckExecutor")
    public CompletableFuture<FraudCheckResponse> checkFraudAsync(FraudCheckRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<FraudCheckRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<FraudCheckResponse> response = restTemplate.exchange(
                    FRAUD_SERVICE_URL,
                    HttpMethod.POST,
                    entity,
                    FraudCheckResponse.class
            );

            return CompletableFuture.completedFuture(response.getBody());
        } catch (Exception e) {
            System.err.println("Async fraud check failed: " + e.getMessage());
            return CompletableFuture.completedFuture(null);
        }
    }
}
