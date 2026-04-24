package com.ecommerce.paymentservice.controller;

import com.ecommerce.paymentservice.model.Payment;
import com.ecommerce.paymentservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /**
     * Process a payment for an order.
     * Delegates to PaymentService for business logic.
     */
    @PostMapping("/process")
    public Payment processPayment(@RequestParam("orderTrackingId") String orderTrackingId,
                                  @RequestParam("amount") Double amount,
                                  @RequestParam("paymentMode") String paymentMode,
                                  @RequestParam("isSuccess") boolean isSuccess) {
        return paymentService.processPayment(orderTrackingId, amount, paymentMode, isSuccess);
    }

    /**
     * Get all payment records.
     */
    @GetMapping("/all")
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }
}
