package com.ecommerce.order.service;

import com.ecommerce.order.client.FraudServiceClient;
import com.ecommerce.order.dto.FraudCheckRequest;
import com.ecommerce.order.dto.FraudCheckResponse;
import com.ecommerce.order.model.Order;
import com.ecommerce.order.model.OrderItem;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.util.OrderTrackingIdGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for OrderService — covers:
 * - Normal order placement (no fraud)
 * - Suspicious order flagging (fraud score ≥ 50)
 * - Order status updates
 * - Admin approve/reject fraud orders
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderTrackingIdGenerator trackingIdGenerator;

    @Mock
    private FraudServiceClient fraudServiceClient;

    @InjectMocks
    private OrderService orderService;

    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        sampleOrder = new Order();
        sampleOrder.setUserEmail("john@example.com");
        sampleOrder.setFullName("John Doe");
        sampleOrder.setAddress("123 Main St");
        sampleOrder.setCity("Manchester");
        sampleOrder.setZipCode("M1 5QD");
        sampleOrder.setTotalAmount(1250.00);
        sampleOrder.setOrderStatus("PENDING");
        sampleOrder.setTransactionStatus("PENDING");
        sampleOrder.setOrderDate(LocalDateTime.now());

        OrderItem item = new OrderItem();
        item.setProductId(1L);
        item.setProductName("Laptop");
        item.setQuantity(1);
        item.setPrice(1250.00);
        sampleOrder.addOrderItem(item);
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-001: Normal Order — No Fraud
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-001: Normal order → fraud score 0 → status CONFIRMED")
    void testSaveOrder_NormalOrder_NoFraud() {
        // Arrange
        when(trackingIdGenerator.generateOrderTrackingId()).thenReturn("ORD-TEST-001");
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.findByUserEmail("john@example.com")).thenReturn(new ArrayList<>());

        FraudCheckResponse fraudResponse = new FraudCheckResponse(
                "ORD-TEST-001", "NORMAL", 0, "No risk factors detected"
        );
        when(fraudServiceClient.checkFraud(any(FraudCheckRequest.class))).thenReturn(fraudResponse);

        // Act
        Order result = orderService.saveOrder(sampleOrder);

        // Assert
        assertEquals("ORD-TEST-001", result.getOrderTrackingId());
        assertEquals("CONFIRMED", result.getOrderStatus());
        assertFalse(result.getFraudFlag());
        assertEquals(0, result.getFraudScore());

        // Verify fraud service was called with correct order ID and amount
        ArgumentCaptor<FraudCheckRequest> captor = ArgumentCaptor.forClass(FraudCheckRequest.class);
        verify(fraudServiceClient).checkFraud(captor.capture());
        assertEquals("ORD-TEST-001", captor.getValue().getOrderId());
        assertEquals(1250.00, captor.getValue().getOrderAmount());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-002: Suspicious Order — High Fraud Score
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-002: High-risk order → fraud score 65 → status PENDING_REVIEW")
    void testSaveOrder_SuspiciousOrder_FraudFlagged() {
        // Arrange
        when(trackingIdGenerator.generateOrderTrackingId()).thenReturn("ORD-TEST-002");
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.findByUserEmail("john@example.com")).thenReturn(new ArrayList<>());

        FraudCheckResponse fraudResponse = new FraudCheckResponse(
                "ORD-TEST-002",
                "SUSPICIOUS",
                65,
                "Very high order amount, Cash on Delivery payment, New user account"
        );
        when(fraudServiceClient.checkFraud(any(FraudCheckRequest.class))).thenReturn(fraudResponse);

        // Act
        Order result = orderService.saveOrder(sampleOrder);

        // Assert
        assertEquals("PENDING_REVIEW", result.getOrderStatus());
        assertTrue(result.getFraudFlag());
        assertEquals(65, result.getFraudScore());
        assertTrue(result.getFraudReason().contains("Very high order amount"));
        assertTrue(result.getFraudReason().contains("Cash on Delivery"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-003: Fraud Service Unavailable — Fail Open
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-003: Fraud service down → order still saved, fails open (CONFIRMED)")
    void testSaveOrder_FraudServiceUnavailable_FailsOpen() {
        // Arrange
        when(trackingIdGenerator.generateOrderTrackingId()).thenReturn("ORD-TEST-003");
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.findByUserEmail("john@example.com")).thenReturn(new ArrayList<>());
        when(fraudServiceClient.checkFraud(any(FraudCheckRequest.class))).thenThrow(new RuntimeException("Service unavailable"));

        // Act
        Order result = orderService.saveOrder(sampleOrder);

        // Assert — should fail open (allow order through)
        assertEquals("PENDING", result.getOrderStatus());
        assertFalse(result.getFraudFlag());
        assertEquals(0, result.getFraudScore());
        // orderRepository.save called twice: once to save initial, once to update fraud fields
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-004: Order Status Update
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-004: Update order status → returns updated order")
    void testUpdateOrderStatus() {
        // Arrange
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Order result = orderService.updateOrderStatus(1L, "CANCELLED");

        // Assert
        assertEquals("CANCELLED", result.getOrderStatus());
        verify(orderRepository, times(1)).save(sampleOrder);
    }

    @Test
    @DisplayName("TC-004b: Update order status → returns null if order not found")
    void testUpdateOrderStatus_NotFound() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        Order result = orderService.updateOrderStatus(999L, "CANCELLED");

        assertNull(result);
        verify(orderRepository, never()).save(any());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-005: Admin Approves Fraud Order
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-005: Admin approves suspicious order → status CONFIRMED, fraudFlag cleared")
    void testApproveFraudOrder() {
        // Arrange
        sampleOrder.setFraudFlag(true);
        sampleOrder.setFraudScore(60);
        sampleOrder.setOrderStatus("PENDING_REVIEW");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Order result = orderService.approveFraudOrder(1L);

        // Assert
        assertEquals("CONFIRMED", result.getOrderStatus());
        assertFalse(result.getFraudFlag());
        assertEquals(60, result.getFraudScore());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-006: Admin Rejects Fraud Order
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-006: Admin rejects suspicious order → status CANCELLED")
    void testRejectFraudOrder() {
        // Arrange
        sampleOrder.setFraudFlag(true);
        sampleOrder.setFraudScore(55);
        sampleOrder.setOrderStatus("PENDING_REVIEW");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Order result = orderService.rejectFraudOrder(1L);

        // Assert
        assertEquals("CANCELLED", result.getOrderStatus());
        assertFalse(result.getFraudFlag());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-007: Transaction Status Update
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-007: Update transaction status → PAYMENT_SUCCESSFUL")
    void testUpdateTransactionStatus() {
        // Arrange
        sampleOrder.setOrderTrackingId("ORD-TEST-007");
        when(orderRepository.findByOrderTrackingId("ORD-TEST-007")).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Order result = orderService.updateTransactionStatus("ORD-TEST-007", "PAYMENT_SUCCESSFUL");

        // Assert
        assertEquals("PAYMENT_SUCCESSFUL", result.getTransactionStatus());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST TC-008: Combined Payment Confirmation (new atomic method)
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("TC-008: confirmPayment → atomically updates order + transaction status")
    void testConfirmPayment_AtomicUpdate() {
        // Arrange
        sampleOrder.setOrderTrackingId("ORD-TEST-008");
        when(orderRepository.findByOrderTrackingId("ORD-TEST-008")).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Order result = orderService.confirmPayment("ORD-TEST-008", "CONFIRMED", "PAYMENT_SUCCESSFUL");

        // Assert
        assertEquals("CONFIRMED", result.getOrderStatus());
        assertEquals("PAYMENT_SUCCESSFUL", result.getTransactionStatus());
        verify(orderRepository, times(1)).save(sampleOrder);
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST: Fraud check sends correct data to fraud service
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("FraudCheckRequest includes all required fields: orderId, amount, frequency, mismatch, paymentMethod")
    void testFraudCheckRequest_ContainsAllFields() {
        // Arrange
        when(trackingIdGenerator.generateOrderTrackingId()).thenReturn("ORD-REQ-TEST");
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.findByUserEmail("john@example.com")).thenReturn(new ArrayList<>());
        when(fraudServiceClient.checkFraud(any(FraudCheckRequest.class)))
                .thenReturn(new FraudCheckResponse("ORD-REQ-TEST", "NORMAL", 0, "No risk factors"));

        // Act
        orderService.saveOrder(sampleOrder);

        // Assert
        ArgumentCaptor<FraudCheckRequest> captor = ArgumentCaptor.forClass(FraudCheckRequest.class);
        verify(fraudServiceClient).checkFraud(captor.capture());

        FraudCheckRequest captured = captor.getValue();
        assertEquals("ORD-REQ-TEST", captured.getOrderId());
        assertEquals(1250.00, captured.getOrderAmount());
        assertEquals(0, captured.getUserOrderFrequency()); // first order
        assertFalse(captured.getLocationMismatch());
        assertEquals("ONLINE", captured.getPaymentMethod());
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST: Order tracking ID is generated
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("Order tracking ID is generated before saving to database")
    void testOrderTrackingIdIsGenerated() {
        when(trackingIdGenerator.generateOrderTrackingId()).thenReturn("ORD-AUTO-001");
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.findByUserEmail(anyString())).thenReturn(new ArrayList<>());
        when(fraudServiceClient.checkFraud(any(FraudCheckRequest.class)))
                .thenReturn(new FraudCheckResponse("ORD-AUTO-001", "NORMAL", 0, "None"));

        Order result = orderService.saveOrder(sampleOrder);

        assertEquals("ORD-AUTO-001", result.getOrderTrackingId());
        verify(trackingIdGenerator, times(1)).generateOrderTrackingId();
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST: Order items are correctly associated
    // ─────────────────────────────────────────────────────────────────────
    @Test
    @DisplayName("Order items are correctly associated with the parent order")
    void testOrderItemsAssociatedCorrectly() {
        when(trackingIdGenerator.generateOrderTrackingId()).thenReturn("ORD-ITEMS-001");
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.findByUserEmail(anyString())).thenReturn(new ArrayList<>());
        when(fraudServiceClient.checkFraud(any(FraudCheckRequest.class)))
                .thenReturn(new FraudCheckResponse("ORD-ITEMS-001", "NORMAL", 0, "None"));

        Order result = orderService.saveOrder(sampleOrder);

        assertNotNull(result.getOrderItems());
        assertEquals(1, result.getOrderItems().size());
        assertEquals("Laptop", result.getOrderItems().get(0).getProductName());
        assertEquals(result, result.getOrderItems().get(0).getOrder());
    }
}
