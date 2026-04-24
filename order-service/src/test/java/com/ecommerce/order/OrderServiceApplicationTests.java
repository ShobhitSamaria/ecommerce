package com.ecommerce.order;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.cloud.discovery.enabled=false",
    "eureka.client.enabled=false"
})
class OrderServiceApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring context loads successfully
    }
}
