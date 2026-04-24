package com.ecommerce.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main Application Class for Order Service
 * 
 * @author Student
 * @version 1.0
 * @since 2024
 */
@SpringBootApplication
@EnableDiscoveryClient  // Registers with Eureka Server
@EnableAsync           // Enables @Async for non-blocking fraud checks
public class OrderServiceApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
