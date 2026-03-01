package com.fenpai.repository;

import com.fenpai.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("SELECT e FROM Expense e JOIN FETCH e.group JOIN FETCH e.paidBy WHERE e.group.id = :groupId ORDER BY e.createdAt DESC")
    List<Expense> findByGroupIdOrderByCreatedAtDesc(@Param("groupId") Long groupId);

    @Query("SELECT e FROM Expense e JOIN FETCH e.group JOIN FETCH e.paidBy WHERE e.id = :id")
    Optional<Expense> findByIdWithRelations(@Param("id") Long id);
}
