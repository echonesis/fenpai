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
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        User paidBy = userRepository.findById(paidByUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Expense expense = Expense.builder()
            .group(group)
            .paidBy(paidBy)
            .description(description)
            .amount(amount)
            .splitType(splitType)
            .build();
        expense = expenseRepository.save(expense);

        List<ExpenseSplit> splits = new ArrayList<>();
        if ("EQUAL".equals(splitType)) {
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
}
