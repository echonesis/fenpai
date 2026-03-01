package com.fenpai.repository;

import com.fenpai.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByFromUserIdOrToUserId(Long fromUserId, Long toUserId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.fromUser JOIN FETCH p.toUser WHERE p.group.id = :groupId")
    List<Payment> findByGroupIdWithRelations(@Param("groupId") Long groupId);
}
