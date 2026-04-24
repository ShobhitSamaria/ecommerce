package com.ecommerce.suspiciousorderservice.repository;

import com.ecommerce.suspiciousorderservice.model.FraudCheckRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FraudCheckRecordRepository extends JpaRepository<FraudCheckRecord, Long> {

    // Look up a fraud result by the order ID from order-service
    Optional<FraudCheckRecord> findByOrderId(String orderId);
}
