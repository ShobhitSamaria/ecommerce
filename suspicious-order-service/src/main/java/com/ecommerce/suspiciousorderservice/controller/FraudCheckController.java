package com.ecommerce.suspiciousorderservice.controller;

import com.ecommerce.suspiciousorderservice.dto.FraudCheckRequest;
import com.ecommerce.suspiciousorderservice.model.FraudCheckRecord;
import com.ecommerce.suspiciousorderservice.repository.FraudCheckRecordRepository;
import com.ecommerce.suspiciousorderservice.service.FraudDetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.StringWriter;
import java.util.List;

@RestController
@RequestMapping("/api/fraud")
@CrossOrigin(origins = "*")
public class FraudCheckController {

    @Autowired
    private FraudDetectionService fraudDetectionService;

    @Autowired
    private FraudCheckRecordRepository fraudCheckRecordRepository;

    // POST /api/fraud/check - Main fraud detection endpoint
    @PostMapping("/check")
    public ResponseEntity<FraudCheckRecord> checkFraud(@RequestBody FraudCheckRequest request) {
        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);
        return ResponseEntity.ok(result);
    }

    // GET /api/fraud/export - Export all fraud records as CSV for Power BI
    @GetMapping("/export")
    public ResponseEntity<String> exportCsv() {
        List<FraudCheckRecord> records = fraudCheckRecordRepository.findAll();
        
        StringWriter csv = new StringWriter();
        
        // Header row
        csv.append("orderId,userId,orderAmount,fraudScore,status,reason,paymentMethod,locationMismatch,userOrderFrequency,accountAgeInDays,failedPaymentAttempts,orderHour,createdAt\n");
        
        // Data rows
        for (FraudCheckRecord r : records) {
            csv.append(String.format("%s,%s,%.2f,%d,%s,%s,%s,%s,%d,%d,%d,%d,%s\n",
                escapeCSV(r.getOrderId()),
                escapeCSV(r.getUserId()),
                r.getOrderAmount() != null ? r.getOrderAmount() : 0.0,
                r.getFraudScore() != null ? r.getFraudScore() : 0,
                escapeCSV(r.getStatus()),
                escapeCSV(r.getReason()),
                escapeCSV(r.getPaymentMethod()),
                r.getLocationMismatch() != null ? r.getLocationMismatch().toString() : "false",
                r.getUserOrderFrequency() != null ? r.getUserOrderFrequency() : 0,
                r.getAccountAgeInDays() != null ? r.getAccountAgeInDays() : 0,
                r.getFailedPaymentAttempts() != null ? r.getFailedPaymentAttempts() : 0,
                r.getOrderHour() != null ? r.getOrderHour() : 0,
                r.getCreatedAt() != null ? r.getCreatedAt().toString() : ""
            ));
        }
        
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=fraud_check_results.csv")
                .body(csv.toString());
    }

    // GET /api/fraud/all - Get all fraud records as JSON
    @GetMapping("/all")
    public ResponseEntity<List<FraudCheckRecord>> getAllRecords() {
        return ResponseEntity.ok(fraudCheckRecordRepository.findAll());
    }

    // Helper to escape CSV values
    private String escapeCSV(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
