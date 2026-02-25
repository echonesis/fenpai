package com.fenpai.repository;

import com.fenpai.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByFromUserIdOrToUserId(Long fromUserId, Long toUserId);
    List<Payment> findByGroupId(Long groupId);
}
