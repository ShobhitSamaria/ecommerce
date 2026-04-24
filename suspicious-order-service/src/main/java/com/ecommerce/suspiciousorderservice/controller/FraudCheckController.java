package com.ecommerce.suspiciousorderservice.controller;

import com.ecommerce.suspiciousorderservice.dto.FraudCheckRequest;
import com.ecommerce.suspiciousorderservice.model.FraudCheckRecord;
import com.ecommerce.suspiciousorderservice.service.FraudDetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fraud")
@CrossOrigin(origins = "*")
public class FraudCheckController {

    @Autowired
    private FraudDetectionService fraudDetectionService;

    // POST /api/fraud/check - Main fraud detection endpoint
    @PostMapping("/check")
    public ResponseEntity<FraudCheckRecord> checkFraud(@RequestBody FraudCheckRequest request) {
        FraudCheckRecord result = fraudDetectionService.analyzeOrder(request);
        return ResponseEntity.ok(result);
    }
}
