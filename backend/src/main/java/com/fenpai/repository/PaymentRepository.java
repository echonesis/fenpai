package com.fenpai.repository;

import com.fenpai.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByFromUserIdOrToUserId(Long fromUserId, Long toUserId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.fromUser JOIN FETCH p.toUser WHERE p.group.id = :groupId")
    List<Payment> findByGroupIdWithRelations(@Param("groupId") Long groupId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.fromUser.id = :fromId AND p.toUser.id = :toId")
    BigDecimal sumPaymentsBetween(@Param("fromId") Long fromId, @Param("toId") Long toId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.fromUser JOIN FETCH p.toUser WHERE (p.fromUser.id = :a AND p.toUser.id = :b) OR (p.fromUser.id = :b AND p.toUser.id = :a)")
    List<Payment> findBetweenUsers(@Param("a") Long a, @Param("b") Long b);
}
