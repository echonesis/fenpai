package com.fenpai.controller;

import com.fenpai.model.Expense;
import com.fenpai.service.ExpenseService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    record CreateExpenseRequest(
        @NotNull Long groupId,
        @NotNull Long paidByUserId,
        @NotBlank String description,
        @NotNull @Positive BigDecimal amount,
        @NotBlank String splitType,
        Map<Long, BigDecimal> customSplits
    ) {}

    @PostMapping
    public ResponseEntity<Expense> createExpense(@Valid @RequestBody CreateExpenseRequest req) {
        Expense expense = expenseService.createExpense(
            req.groupId(), req.paidByUserId(), req.description(),
            req.amount(), req.splitType(), req.customSplits()
        );
        return ResponseEntity.ok(expense);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Expense>> getExpensesByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(expenseService.getExpensesByGroup(groupId));
    }
}
