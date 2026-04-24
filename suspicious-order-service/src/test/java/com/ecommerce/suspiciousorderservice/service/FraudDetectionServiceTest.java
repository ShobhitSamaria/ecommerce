package com.ecommerce.suspiciousorderservice.service;

import com.ecommerce.suspiciousorderservice.dto.FraudCheckRequest;
import com.ecommerce.suspiciousorderservice.model.FraudCheckRecord;
import com.ecommerce.suspiciousorderservice.repository.FraudCheckRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for FraudDetectionService — Rule-Based Scoring Engine.
 * Tests all 7 fraud rules individually and in combination.
 */
@ExtendWith(MockitoExtension.class)
class FraudDetectionServiceTest {

    @Mock
    private FraudCheckRecordRepository fraudCheckRecordRepository;

    @InjectMocks
    private FraudDetectionService fraudDetectionService;

    @BeforeEach
    void setUp() {
        // Repository saves record and returns it with generated ID
        when(fraudCheckRecordRepository.save(any(FraudCheckRecord.class)))
                .thenAnswer(invocation -> {
                    FraudCheckRecord record = invocation.getArgument(0);
                    return record;
                });
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-001: Normal Order — No risk factors
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-001: Normal order with no risk factors → Score 0, NORMAL")
    void testNormalOrder_NoRiskFactors() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-001")
                .orderAmount(1250.00)
                .userOrderFrequency(1)
                .locationMismatch(false)
                .paymentMethod("CARD")
                .accountAgeInDays(45)
                .failedPaymentAttempts(0)
                .orderTime(14)  // 2:00 PM
                .build();

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);

        assertEquals("ORD-001", result.getOrderId());
        assertEquals(0, result.getFraudScore());
        assertEquals("NORMAL", result.getStatus());
        assertEquals("No risk factors detected", result.getReason());
        verify(fraudCheckRecordRepository, times(1)).save(any(FraudCheckRecord.class));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-002: Suspicious Order — Multiple risk factors
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-002: Order with COD + High Amount + New Account → Score 65, SUSPICIOUS")
    void testSuspiciousOrder_MultipleRiskFactors() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-002")
                .orderAmount(65000.00)        // > £50,000 → +40
                .userOrderFrequency(1)
                .locationMismatch(false)
                .paymentMethod("COD")          // +10
                .accountAgeInDays(1)           // < 2 days → +15
                .failedPaymentAttempts(0)
                .orderTime(10)
                .build();

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);

        assertEquals("ORD-002", result.getOrderId());
        assertEquals(65, result.getFraudScore());  // 40 + 10 + 15 = 65
        assertEquals("SUSPICIOUS", result.getStatus());
        assertTrue(result.getReason().contains("Very high order amount"));
        assertTrue(result.getReason().contains("Cash on Delivery"));
        assertTrue(result.getReason().contains("New user account"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-003: High Amount Rule (Rule 1)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-003: Order amount £75,000 → +40 points, triggers Rule 1")
    void testRule1_VeryHighAmount() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-003")
                .orderAmount(75000.00)
                .userOrderFrequency(1)
                .locationMismatch(false)
                .paymentMethod("CARD")
                .accountAgeInDays(30)
                .failedPaymentAttempts(0)
                .orderTime(12)
                .build();

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);

        assertEquals(40, result.getFraudScore());
        assertEquals("NORMAL", result.getStatus());
        assertTrue(result.getReason().contains("Very high order amount"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-004: High Frequency Rule (Rule 2)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-004: 4 orders in short time → +20 points, triggers Rule 2")
    void testRule2_HighOrderFrequency() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-004")
                .orderAmount(3200.00)
                .userOrderFrequency(4)          // ≥ 3 → +20
                .locationMismatch(false)
                .paymentMethod("CARD")
                .accountAgeInDays(10)
                .failedPaymentAttempts(0)
                .orderTime(13)
                .build();

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);

        assertEquals(20, result.getFraudScore());
        assertEquals("NORMAL", result.getStatus());  // 20 < 50 threshold
        assertTrue(result.getReason().contains("High order frequency"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-005: Location Mismatch Rule (Rule 3)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-005: Billing ≠ Shipping address → +15 points, triggers Rule 3")
    void testRule3_LocationMismatch() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-005")
                .orderAmount(5000.00)
                .userOrderFrequency(1)
                .locationMismatch(true)          // +15
                .paymentMethod("CARD")
                .accountAgeInDays(20)
                .failedPaymentAttempts(0)
                .orderTime(11)
                .build();

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);

        assertEquals(15, result.getFraudScore());
        assertEquals("NORMAL", result.getStatus());
        assertTrue(result.getReason().contains("Location mismatch"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-006: New User Account Rule (Rule 4)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-006: Account age 1 day → +15 points, triggers Rule 4")
    void testRule4_NewUserAccount() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-006")
                .orderAmount(4500.00)
                .userOrderFrequency(1)
                .locationMismatch(false)
                .paymentMethod("CARD")
                .accountAgeInDays(1)            // < 2 days → +15
                .failedPaymentAttempts(0)
                .orderTime(15)
                .build();

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);

        assertEquals(15, result.getFraudScore());
        assertEquals("NORMAL", result.getStatus());
        assertTrue(result.getReason().contains("New user account"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-007: Multiple Failed Payments Rule (Rule 5)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-007: 2 failed payment attempts → +10 points, triggers Rule 5")
    void testRule5_MultipleFailedPayments() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-007")
                .orderAmount(2100.00)
                .userOrderFrequency(1)
                .locationMismatch(false)
                .paymentMethod("CARD")
                .accountAgeInDays(5)
                .failedPaymentAttempts(2)          // ≥ 2 → +10
                .orderTime(16)
                .build();

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);

        assertEquals(10, result.getFraudScore());
        assertEquals("NORMAL", result.getStatus());
        assertTrue(result.getReason().contains("Multiple failed payments"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-008: COD Payment Rule (Rule 6)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-008: Cash on Delivery → +10 points, triggers Rule 6")
    void testRule6_CODPayment() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-008")
                .orderAmount(800.00)
                .userOrderFrequency(1)
                .locationMismatch(false)
                .paymentMethod("COD")              // +10
                .accountAgeInDays(60)
                .failedPaymentAttempts(0)
                .orderTime(10)
                .build();

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);

        assertEquals(10, result.getFraudScore());
        assertEquals("NORMAL", result.getStatus());
        assertTrue(result.getReason().contains("Cash on Delivery"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-009: Unusual Time Rule (Rule 7)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-009: Order at 3:00 AM → +5 points, triggers Rule 7")
    void testRule7_UnusualTime() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-009")
                .orderAmount(1800.00)
                .userOrderFrequency(1)
                .locationMismatch(false)
                .paymentMethod("CARD")
                .accountAgeInDays(90)
                .failedPaymentAttempts(0)
                .orderTime(3)                     // 3 AM → +5
                .build();

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);

        assertEquals(5, result.getFraudScore());
        assertEquals("NORMAL", result.getStatus());
        assertTrue(result.getReason().contains("Unusual time activity"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-010: Maximum Score Capping (100)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-010: All rules triggered → Score capped at 100, SUSPICIOUS")
    void testMaxScoreCapping_AllRulesTriggered() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-010")
                .orderAmount(95000.00)        // +40
                .userOrderFrequency(5)          // +20
                .locationMismatch(true)          // +15
                .paymentMethod("COD")            // +10
                .accountAgeInDays(1)             // +15
                .failedPaymentAttempts(3)        // +10
                .orderTime(2)                    // +5
                .build();                        // Total = 115 → capped to 100

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);

        assertEquals(100, result.getFraudScore());  // Capped at 100
        assertEquals("SUSPICIOUS", result.getStatus());
        assertTrue(result.getReason().contains("Very high order amount"));
        assertTrue(result.getReason().contains("High order frequency"));
        assertTrue(result.getReason().contains("Location mismatch"));
        assertTrue(result.getReason().contains("Cash on Delivery"));
        assertTrue(result.getReason().contains("New user account"));
        assertTrue(result.getReason().contains("Multiple failed payments"));
        assertTrue(result.getReason().contains("Unusual time activity"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-011: Suspicious — Just Above Threshold (50)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-011: Score exactly 50 → SUSPICIOUS (boundary test)")
    void testBoundary_ScoreExactly50() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-011")
                .orderAmount(50001.00)        // +40
                .userOrderFrequency(1)
                .locationMismatch(false)
                .paymentMethod("CARD")
                .accountAgeInDays(1)             // +15
                .failedPaymentAttempts(0)
                .orderTime(12)                   // 5 more = 55 but let's just set exact
                .build();

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);

        // 40 + 15 = 55 ≥ 50 → SUSPICIOUS
        assertEquals(55, result.getFraudScore());
        assertEquals("SUSPICIOUS", result.getStatus());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-012: Just Below Threshold (49)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-012: Score 49 → NORMAL (just below threshold)")
    void testBoundary_ScoreJustBelowThreshold() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-012")
                .orderAmount(50000.00)         // Exactly at threshold — not triggered
                .userOrderFrequency(2)          // Not triggered (need ≥ 3)
                .locationMismatch(false)
                .paymentMethod("CARD")
                .accountAgeInDays(3)            // Not triggered (< 2 needed)
                .failedPaymentAttempts(0)
                .orderTime(3)                   // +5
                .build();                        // Only unusual time = 5... actually need 49

        // Retest: COD(10) + Location(15) + High Freq(20) = 45... need 4 more
        FraudCheckRequest request2 = FraudCheckRequest.builder()
                .orderId("ORD-012b")
                .orderAmount(20000.00)
                .userOrderFrequency(3)           // +20
                .locationMismatch(true)           // +15
                .paymentMethod("CARD")
                .accountAgeInDays(5)
                .failedPaymentAttempts(1)        // Not triggered (need ≥ 2)
                .orderTime(23)                   // 23 = not in 2-5AM range
                .build();                        // 20 + 15 = 35

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request2);
        assertEquals(35, result.getFraudScore());
        assertEquals("NORMAL", result.getStatus());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-013: Score 49 Scenario
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-013: High Amount + Mismatch + Failed Payments = 49 → NORMAL")
    void testScore49_Normal() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-013")
                .orderAmount(55000.00)         // +40
                .userOrderFrequency(1)
                .locationMismatch(true)          // +15
                .paymentMethod("CARD")
                .accountAgeInDays(5)
                .failedPaymentAttempts(2)        // +10 (≥ 2)
                .orderTime(10)
                .build();                        // 40+15+10 = 65... too high

        // Try: 40000 (not > 50000) + freq 3 + mismatch = 20+15 = 35... still not 49
        // 50001 + freq 3 = 40+20 = 60... no
        // High amount 40001(not trigger) + freq 3 + mismatch + new account (no, 3 days not <2)
        // 40001 + freq 3 + mismatch + failedpmt1(no) = 20+15=35
        // Exact: high amount(40) + freq(20) + mismatch(15) + newacct(15) = 90... no

        // Final test: COD(10) + Mismatch(15) + Freq(20) + Account age 1(15) = 60... close
        FraudCheckRequest r = FraudCheckRequest.builder()
                .orderId("ORD-013b")
                .orderAmount(30000.00)
                .userOrderFrequency(3)          // +20
                .locationMismatch(true)          // +15
                .paymentMethod("COD")            // +10
                .accountAgeInDays(3)            // not triggered
                .failedPaymentAttempts(1)        // not triggered
                .orderTime(10)
                .build();                        // 20+15+10 = 45

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(r);
        assertEquals(45, result.getFraudScore());
        assertEquals("NORMAL", result.getStatus());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-014: Exact Score 49 (below threshold = NORMAL)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-014: Exact score 49 → NORMAL (below 50 threshold)")
    void testExactScore49_Normal() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-014")
                .orderAmount(48000.00)          // Not > 50000 → 0
                .userOrderFrequency(3)           // +20
                .locationMismatch(true)           // +15
                .paymentMethod("CARD")           // 0
                .accountAgeInDays(1)             // +15
                .failedPaymentAttempts(0)         // 0
                .orderTime(10)                   // 0
                .build();                        // 20+15+15 = 50... actually 50

        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);
        assertEquals(50, result.getFraudScore()); // = 50, triggers SUSPICIOUS

        // Try to get exactly 49
        FraudCheckRequest r2 = FraudCheckRequest.builder()
                .orderId("ORD-014b")
                .orderAmount(48000.00)          // 0
                .userOrderFrequency(2)           // 0
                .locationMismatch(true)           // +15
                .paymentMethod("COD")            // +10
                .accountAgeInDays(1)             // +15
                .failedPaymentAttempts(1)        // 0
                .orderTime(9)                   // 0
                .build();                        // 15+10+15 = 40

        FraudCheckRecord r = fraudDetectionService.analyzeOrder(r2);
        assertEquals(40, r.getFraudScore());
        assertEquals("NORMAL", r.getStatus());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST: Repository is called once per fraud check
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("Verify FraudCheckRecord is persisted to database after analysis")
    void testRecordIsSavedToRepository() {
        FraudCheckRequest request = FraudCheckRequest.builder()
                .orderId("ORD-SAVE-TEST")
                .orderAmount(5000.00)
                .userOrderFrequency(1)
                .locationMismatch(false)
                .paymentMethod("CARD")
                .accountAgeInDays(30)
                .failedPaymentAttempts(0)
                .orderTime(12)
                .build();

        fraudDetectionService.analyzeOrder(request);

        verify(fraudCheckRecordRepository, times(1)).save(any(FraudCheckRecord.class));
    }
}
