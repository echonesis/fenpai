package com.fenpai.service;

import com.fenpai.model.*;
import com.fenpai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public Expense createExpense(Long groupId, Long paidByUserId, String description,
                                  BigDecimal amount, String splitType,
                                  Map<Long, BigDecimal> customSplits) {
        Group group = groupId != null
            ? groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"))
            : null;
        User paidBy = userRepository.findById(paidByUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (group == null && !"CUSTOM".equals(splitType)) {
            throw new IllegalArgumentException("Direct expenses must use CUSTOM split type");
        }

        Expense expense = Expense.builder()
            .group(group)
            .paidBy(paidBy)
            .description(description)
            .amount(amount)
            .splitType(splitType)
            .build();
        expense = expenseRepository.save(expense);

        List<ExpenseSplit> splits = new ArrayList<>();
        if ("EQUAL".equals(splitType) && group != null) {
            List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
            BigDecimal splitAmount = amount.divide(
                BigDecimal.valueOf(members.size()), 2, RoundingMode.HALF_UP);
            for (GroupMember member : members) {
                splits.add(ExpenseSplit.builder()
                    .expense(expense)
                    .user(member.getUser())
                    .amount(splitAmount)
                    .build());
            }
        } else if ("CUSTOM".equals(splitType) && customSplits != null) {
            for (Map.Entry<Long, BigDecimal> entry : customSplits.entrySet()) {
                User splitUser = userRepository.findById(entry.getKey())
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + entry.getKey()));
                splits.add(ExpenseSplit.builder()
                    .expense(expense)
                    .user(splitUser)
                    .amount(entry.getValue())
                    .build());
            }
        }
        expenseSplitRepository.saveAll(splits);
        return expenseRepository.findByIdWithRelations(expense.getId()).orElse(expense);
    }

    public List<Expense> getExpensesByGroup(Long groupId) {
        return expenseRepository.findByGroupIdOrderByCreatedAtDesc(groupId);
    }

    public List<Expense> getDirectExpenses(Long userId) {
        return expenseRepository.findDirectExpensesByUserId(userId);
    }

    public Expense getExpenseWithSplits(Long expenseId) {
        return expenseRepository.findByIdWithSplits(expenseId)
            .orElseThrow(() -> new IllegalArgumentException("Expense not found"));
    }

    @Transactional
    public Expense updateExpense(Long expenseId, String currentUserEmail, String description,
                                  BigDecimal amount, String splitType,
                                  Map<Long, BigDecimal> customSplits) {
        Expense expense = expenseRepository.findByIdWithRelations(expenseId)
            .orElseThrow(() -> new IllegalArgumentException("Expense not found"));
        User currentUser = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!expense.getPaidBy().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Forbidden: only the payer can edit this expense");
        }

        expense.setDescription(description);
        expense.setAmount(amount);
        expense.setSplitType(splitType);
        expenseRepository.save(expense);

        expenseSplitRepository.deleteAllByExpenseId(expenseId);

        Long groupId = expense.getGroup() != null ? expense.getGroup().getId() : null;
        if (groupId == null && !"CUSTOM".equals(splitType)) {
            throw new IllegalArgumentException("Direct expenses must use CUSTOM split type");
        }
        List<ExpenseSplit> splits = new ArrayList<>();
        if ("EQUAL".equals(splitType) && groupId != null) {
            List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
            BigDecimal splitAmount = amount.divide(
                BigDecimal.valueOf(members.size()), 2, RoundingMode.HALF_UP);
            for (GroupMember member : members) {
                splits.add(ExpenseSplit.builder()
                    .expense(expense)
                    .user(member.getUser())
                    .amount(splitAmount)
                    .build());
            }
        } else if ("CUSTOM".equals(splitType) && customSplits != null) {
            for (Map.Entry<Long, BigDecimal> entry : customSplits.entrySet()) {
                User splitUser = userRepository.findById(entry.getKey())
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + entry.getKey()));
                splits.add(ExpenseSplit.builder()
                    .expense(expense)
                    .user(splitUser)
                    .amount(entry.getValue())
                    .build());
            }
        }
        expenseSplitRepository.saveAll(splits);
        return expenseRepository.findByIdWithRelations(expense.getId()).orElse(expense);
    }

    @Transactional
    public void deleteExpense(Long expenseId, String currentUserEmail) {
        Expense expense = expenseRepository.findByIdWithRelations(expenseId)
            .orElseThrow(() -> new IllegalArgumentException("Expense not found"));
        User currentUser = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!expense.getPaidBy().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Forbidden: only the payer can delete this expense");
        }
        expenseRepository.delete(expense);
    }
}
