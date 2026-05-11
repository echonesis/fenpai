package com.fenpai.repository;

import com.fenpai.model.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {
    List<ExpenseSplit> findByExpenseId(Long expenseId);
    List<ExpenseSplit> findByUserId(Long userId);

    @Query("SELECT s FROM ExpenseSplit s JOIN FETCH s.user JOIN FETCH s.expense e JOIN FETCH e.paidBy WHERE e.group.id = :groupId")
    List<ExpenseSplit> findByExpenseGroupIdWithRelations(@Param("groupId") Long groupId);

    @Modifying
    @Query("DELETE FROM ExpenseSplit s WHERE s.expense.id = :expenseId")
    void deleteAllByExpenseId(@Param("expenseId") Long expenseId);

    @Query("""
        SELECT COALESCE(SUM(es.amount), 0)
        FROM ExpenseSplit es JOIN es.expense e
        WHERE e.paidBy.id = :payerId AND es.user.id = :debtorId
        """)
    BigDecimal sumAmountOwed(@Param("payerId") Long payerId, @Param("debtorId") Long debtorId);
}
