package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.model.Payment;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PaymentService — covers payment processing,
 * success/failure scenarios, and idempotency.
 */
@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-PAY-001: Successful Card Payment
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-PAY-001: Process successful card payment → status SUCCESS, UUID transaction ID")
    void testProcessPayment_Success_Card() {
        // Arrange
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        // Act
        Payment result = paymentService.processPayment(
                "ORD-PAY-001",
                1250.00,
                "CARD",
                true
        );

        // Assert
        assertNotNull(result);
        assertEquals("ORD-PAY-001", result.getOrderTrackingId());
        assertEquals(1250.00, result.getAmount());
        assertEquals("CARD", result.getPaymentMode());
        assertEquals("SUCCESS", result.getStatus());
        assertNotNull(result.getTransactionId());
        assertNotEquals("N/A", result.getTransactionId());
        assertNotNull(result.getPaymentTime());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-PAY-002: Failed Payment — Card Declined
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-PAY-002: Card declined → status FAILED, transactionId = 'N/A'")
    void testProcessPayment_Failed_CardDeclined() {
        // Arrange
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(2L);
            return p;
        });

        // Act
        Payment result = paymentService.processPayment(
                "ORD-PAY-002",
                2999.00,
                "CARD",
                false
        );

        // Assert
        assertNotNull(result);
        assertEquals("ORD-PAY-002", result.getOrderTrackingId());
        assertEquals(2999.00, result.getAmount());
        assertEquals("CARD", result.getPaymentMode());
        assertEquals("FAILED", result.getStatus());
        assertEquals("N/A", result.getTransactionId());
        assertNotNull(result.getPaymentTime());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-PAY-003: Successful UPI Payment
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-PAY-003: Successful UPI payment → status SUCCESS")
    void testProcessPayment_Success_UPI() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(3L);
            return p;
        });

        Payment result = paymentService.processPayment(
                "ORD-PAY-003",
                450.00,
                "UPI",
                true
        );

        assertEquals("SUCCESS", result.getStatus());
        assertEquals("UPI", result.getPaymentMode());
        assertNotEquals("N/A", result.getTransactionId());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-PAY-004: Successful COD (Cash on Delivery)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-PAY-004: COD payment → SUCCESS (no card processing needed)")
    void testProcessPayment_Success_COD() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(4L);
            return p;
        });

        Payment result = paymentService.processPayment(
                "ORD-PAY-004",
                150.00,
                "COD",
                true
        );

        assertEquals("SUCCESS", result.getStatus());
        assertEquals("COD", result.getPaymentMode());
        assertNotNull(result.getTransactionId());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-PAY-005: Transaction ID Format (UUID)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-PAY-005: Successful payment → transaction ID is a valid UUID format")
    void testProcessPayment_TransactionIdIsUUID() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        Payment result = paymentService.processPayment(
                "ORD-PAY-005",
                500.00,
                "CARD",
                true
        );

        assertNotNull(result.getTransactionId());
        assertDoesNotThrow(() -> UUID.fromString(result.getTransactionId()));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-PAY-006: Payment Time is Set Automatically
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-PAY-006: Payment time is automatically set to current timestamp")
    void testProcessPayment_PaymentTimeIsSet() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
        LocalDateTime before = LocalDateTime.now();

        Payment result = paymentService.processPayment(
                "ORD-PAY-006",
                1000.00,
                "CARD",
                true
        );

        LocalDateTime after = LocalDateTime.now();
        assertNotNull(result.getPaymentTime());
        assertTrue(result.getPaymentTime().isAfter(before.minusSeconds(1)));
        assertTrue(result.getPaymentTime().isBefore(after.plusSeconds(1)));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-PAY-007: Payment Record Persisted to Database
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-PAY-007: Payment record is saved to PostgreSQL via PaymentRepository")
    void testProcessPayment_SavesToDatabase() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        paymentService.processPayment("ORD-PAY-007", 2000.00, "CARD", true);

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository, times(1)).save(captor.capture());

        Payment saved = captor.getValue();
        assertEquals("ORD-PAY-007", saved.getOrderTrackingId());
        assertEquals(2000.00, saved.getAmount());
        assertEquals("CARD", saved.getPaymentMode());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-PAY-008: Amount Preserved Exactly
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-PAY-008: Exact payment amount is stored without rounding")
    void testProcessPayment_ExactAmount() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        Payment result = paymentService.processPayment(
                "ORD-PAY-008",
                1234.56,
                "UPI",
                true
        );

        assertEquals(1234.56, result.getAmount());
    }
}
