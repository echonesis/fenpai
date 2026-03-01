package com.fenpai.repository;

import com.fenpai.model.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {
    List<ExpenseSplit> findByExpenseId(Long expenseId);
    List<ExpenseSplit> findByUserId(Long userId);

    @Query("SELECT s FROM ExpenseSplit s JOIN FETCH s.user JOIN FETCH s.expense e JOIN FETCH e.paidBy WHERE e.group.id = :groupId")
    List<ExpenseSplit> findByExpenseGroupIdWithRelations(@Param("groupId") Long groupId);
}
