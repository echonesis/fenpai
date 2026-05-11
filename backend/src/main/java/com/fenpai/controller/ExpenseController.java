package com.fenpai.controller;

import com.fenpai.model.Expense;
import com.fenpai.model.ExpenseSplit;
import com.fenpai.service.ExpenseService;
import com.fenpai.service.GroupService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final GroupService groupService;

    record CreateExpenseRequest(
        Long groupId,
        @NotNull Long paidByUserId,
        @NotBlank String description,
        @NotNull @Positive BigDecimal amount,
        @NotBlank String splitType,
        Map<Long, BigDecimal> customSplits
    ) {}

    record SplitDetail(Long userId, String userName, BigDecimal amount) {}

    record ExpenseDetailResponse(
        Long id, String description, BigDecimal amount, String splitType,
        Long groupId, String groupName, Long paidById, String paidByName,
        List<SplitDetail> splits
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

    @GetMapping("/direct")
    public ResponseEntity<List<Expense>> getDirectExpenses(Principal principal) {
        Long userId = groupService.getUserByEmail(principal.getName()).getId();
        return ResponseEntity.ok(expenseService.getDirectExpenses(userId));
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<ExpenseDetailResponse> getExpense(@PathVariable Long expenseId) {
        Expense e = expenseService.getExpenseWithSplits(expenseId);
        List<SplitDetail> splits = e.getSplits().stream()
            .map(s -> new SplitDetail(s.getUser().getId(), s.getUser().getName(), s.getAmount()))
            .toList();
        return ResponseEntity.ok(new ExpenseDetailResponse(
            e.getId(), e.getDescription(), e.getAmount(), e.getSplitType(),
            e.getGroup().getId(), e.getGroup().getName(),
            e.getPaidBy().getId(), e.getPaidBy().getName(),
            splits
        ));
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long expenseId,
                                                  @Valid @RequestBody CreateExpenseRequest req,
                                                  Principal principal) {
        Expense expense = expenseService.updateExpense(
            expenseId, principal.getName(),
            req.description(), req.amount(), req.splitType(), req.customSplits()
        );
        return ResponseEntity.ok(expense);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long expenseId, Principal principal) {
        expenseService.deleteExpense(expenseId, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
