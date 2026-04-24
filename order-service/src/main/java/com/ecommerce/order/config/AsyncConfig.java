package com.ecommerce.order.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Async configuration for non-blocking fraud checks.
 * Dedicated thread pool prevents fraud detection from blocking the main request thread.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "fraudCheckExecutor")
    public Executor fraudCheckExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("fraud-check-");
        executor.initialize();
        return executor;
    }
}
