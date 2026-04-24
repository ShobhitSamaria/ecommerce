package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.model.Payment;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Payment processing service — handles payment creation,
 * success/failure logic, and transaction ID generation.
 */
@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    /**
     * Process a payment for an order.
     *
     * @param orderTrackingId  Unique order identifier
     * @param amount           Payment amount
     * @param paymentMode      CARD, UPI, or COD
     * @param isSuccess        true = payment succeeded, false = declined/failed
     * @return                 Saved Payment record
     */
    public Payment processPayment(String orderTrackingId, Double amount,
                                  String paymentMode, boolean isSuccess) {
        Payment payment = new Payment();
        payment.setOrderTrackingId(orderTrackingId);
        payment.setAmount(amount);
        payment.setPaymentMode(paymentMode);
        payment.setPaymentTime(LocalDateTime.now());

        if (isSuccess) {
            payment.setStatus("SUCCESS");
            payment.setTransactionId(UUID.randomUUID().toString());
        } else {
            payment.setStatus("FAILED");
            payment.setTransactionId("N/A");
        }

        return paymentRepository.save(payment);
    }

    /**
     * Retrieve all payment records from the database.
     */
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
}
