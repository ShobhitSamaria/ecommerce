package com.ecommerce.order.util;

import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Component
public class OrderTrackingIdGenerator {
    
    private static final String PREFIX = "ORD";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyMMdd");
    private static final Random RANDOM = new Random();
    
    public String generateOrderTrackingId() {
        String datePart = LocalDate.now().format(DATE_FORMAT);
        int randomPart = 1000 + RANDOM.nextInt(9000);
        return PREFIX + datePart + randomPart;
    }
}
