package com.ecommerce.suspiciousorderservice.service;

import com.ecommerce.suspiciousorderservice.dto.FraudCheckRequest;
import com.ecommerce.suspiciousorderservice.model.FraudCheckRecord;
import com.ecommerce.suspiciousorderservice.repository.FraudCheckRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class FraudDetectionService {

    // If score reaches this → order is flagged as SUSPICIOUS
    private static final int FRAUD_THRESHOLD = 50;

    // If order amount exceeds this → very high value order
    private static final double VERY_HIGH_AMOUNT_THRESHOLD = 50000.0;

    // Minimum order frequency to trigger the repeated-order rule
    private static final int HIGH_FREQUENCY_THRESHOLD = 3;

    // Minimum failed payments before this rule triggers
    private static final int FAILED_PAYMENT_THRESHOLD = 2;

    // Unusual activity window: 2AM to 5AM (hours 2, 3, 4)
    private static final int UNUSUAL_TIME_START = 2;
    private static final int UNUSUAL_TIME_END = 5;

    // Account age below this (in days) → flagged as new/suspicious
    private static final int NEW_ACCOUNT_THRESHOLD_DAYS = 2;

    // --- Individual rule scores ---

    private static final int VERY_HIGH_AMOUNT_SCORE           = 40;
    private static final int HIGH_FREQUENCY_SCORE              = 20;
    private static final int LOCATION_MISMATCH_SCORE            = 15;
    private static final int NEW_USER_ACCOUNT_SCORE              = 15;
    private static final int MULTIPLE_FAILED_PAYMENTS_SCORE     = 10;
    private static final int COD_PAYMENT_SCORE                  = 10;
    private static final int UNUSUAL_TIME_SCORE                = 5;

    @Autowired
    private FraudCheckRecordRepository fraudCheckRecordRepository;

    /**
     * Analyses an order and returns a fraud assessment.
     * Each triggered rule adds points; score capped at 100.
     * Score >= 50 → SUSPICIOUS, else NORMAL.
     * Result is saved to the database for audit purposes.
     *
     * @param request  order data sent by order-service
     * @return         FraudCheckRecord with score, status, and reason
     */
    public FraudCheckRecord analyzeOrder(FraudCheckRequest request) {
        int score = 0;
        List<String> reasons = new ArrayList<>();

        // Rule 1: Very high order amount (e.g. > £50,000)
        if (request.getOrderAmount() != null
                && request.getOrderAmount() > VERY_HIGH_AMOUNT_THRESHOLD) {
            score += VERY_HIGH_AMOUNT_SCORE;
            reasons.add("Very high order amount");
        }

        // Rule 2: High order frequency — user placed too many orders in short time
        if (request.getUserOrderFrequency() != null
                && request.getUserOrderFrequency() >= HIGH_FREQUENCY_THRESHOLD) {
            score += HIGH_FREQUENCY_SCORE;
            reasons.add("High order frequency");
        }

        // Rule 3: Billing address different from shipping address
        if (Boolean.TRUE.equals(request.getLocationMismatch())) {
            score += LOCATION_MISMATCH_SCORE;
            reasons.add("Location mismatch");
        }

        // Rule 4: Cash on Delivery — harder to trace, higher risk
        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            score += COD_PAYMENT_SCORE;
            reasons.add("Cash on Delivery payment");
        }

        // Rule 5: Account created recently (less than 2 days old)
        if (request.getAccountAgeInDays() != null
                && request.getAccountAgeInDays() < NEW_ACCOUNT_THRESHOLD_DAYS) {
            score += NEW_USER_ACCOUNT_SCORE;
            reasons.add("New user account");
        }

        // Rule 6: Multiple failed payment attempts before this order
        if (request.getFailedPaymentAttempts() != null
                && request.getFailedPaymentAttempts() >= FAILED_PAYMENT_THRESHOLD) {
            score += MULTIPLE_FAILED_PAYMENTS_SCORE;
            reasons.add("Multiple failed payments");
        }

        // Rule 7: Order placed during unusual hours (2AM–5AM)
        if (request.getOrderTime() != null
                && request.getOrderTime() >= UNUSUAL_TIME_START
                && request.getOrderTime() <= UNUSUAL_TIME_END) {
            score += UNUSUAL_TIME_SCORE;
            reasons.add("Unusual time activity");
        }

        // Cap total score at 100
        score = Math.min(score, 100);

        // Determine final status
        String status = score >= FRAUD_THRESHOLD ? "SUSPICIOUS" : "NORMAL";
        String reason = reasons.isEmpty()
                ? "No risk factors detected"
                : String.join(", ", reasons);

        // Build and save the fraud check record to the database
        FraudCheckRecord record = FraudCheckRecord.builder()
                .orderId(request.getOrderId())
                .userId(request.getUserId())
                .orderAmount(request.getOrderAmount())
                .fraudScore(score)
                .status(status)
                .reason(reason)
                .paymentMethod(request.getPaymentMethod())
                .locationMismatch(request.getLocationMismatch())
                .userOrderFrequency(request.getUserOrderFrequency())
                .accountAgeInDays(request.getAccountAgeInDays())
                .failedPaymentAttempts(request.getFailedPaymentAttempts())
                .orderHour(request.getOrderTime())
                .createdAt(LocalDateTime.now())
                .build();

        return fraudCheckRecordRepository.save(record);
    }
}
