package com.fenpai.service;

import com.fenpai.model.*;
import com.fenpai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BalanceService {

    private final ExpenseSplitRepository expenseSplitRepository;
    private final PaymentRepository paymentRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public record BalanceItem(Long fromUserId, String fromUserName,
                              Long toUserId, String toUserName,
                              BigDecimal amount) {}

    @Transactional(readOnly = true)
    public List<BalanceItem> calculateBalances(Long groupId) {
        Map<Long, BigDecimal> balanceMap = new LinkedHashMap<>();
        Map<Long, String> nameMap = new HashMap<>();

        // Step 1: accumulate net balance from expense splits
        List<ExpenseSplit> splits = expenseSplitRepository.findByExpenseGroupIdWithRelations(groupId);
        for (ExpenseSplit s : splits) {
            User debtor = s.getUser();
            User creditor = s.getExpense().getPaidBy();
            if (debtor.getId().equals(creditor.getId())) continue;

            nameMap.put(debtor.getId(), debtor.getName());
            nameMap.put(creditor.getId(), creditor.getName());
            balanceMap.merge(debtor.getId(), s.getAmount().negate(), BigDecimal::add);
            balanceMap.merge(creditor.getId(), s.getAmount(), BigDecimal::add);
        }

        // Step 2: subtract settled payments
        List<Payment> payments = paymentRepository.findByGroupIdWithRelations(groupId);
        for (Payment p : payments) {
            User fromUser = p.getFromUser();
            User toUser = p.getToUser();
            nameMap.putIfAbsent(fromUser.getId(), fromUser.getName());
            nameMap.putIfAbsent(toUser.getId(), toUser.getName());
            balanceMap.merge(fromUser.getId(), p.getAmount(), BigDecimal::add);
            balanceMap.merge(toUser.getId(), p.getAmount().negate(), BigDecimal::add);
        }

        // Step 3: greedy minimum transactions
        List<BalanceItem> result = new ArrayList<>();
        PriorityQueue<Map.Entry<Long, BigDecimal>> debtors =
            new PriorityQueue<>((a, b) -> a.getValue().compareTo(b.getValue()));
        PriorityQueue<Map.Entry<Long, BigDecimal>> creditors =
            new PriorityQueue<>((a, b) -> b.getValue().compareTo(a.getValue()));

        for (Map.Entry<Long, BigDecimal> entry : balanceMap.entrySet()) {
            int cmp = entry.getValue().compareTo(BigDecimal.ZERO);
            if (cmp < 0) {
                debtors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()));
            } else if (cmp > 0) {
                creditors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()));
            }
        }

        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            Map.Entry<Long, BigDecimal> debtor = debtors.poll();
            Map.Entry<Long, BigDecimal> creditor = creditors.poll();

            BigDecimal debtAbs = debtor.getValue().negate();
            BigDecimal credit = creditor.getValue();
            BigDecimal transfer = debtAbs.min(credit);

            result.add(new BalanceItem(
                debtor.getKey(), nameMap.get(debtor.getKey()),
                creditor.getKey(), nameMap.get(creditor.getKey()),
                transfer
            ));

            BigDecimal remainDebt = debtAbs.subtract(transfer).negate();
            BigDecimal remainCredit = credit.subtract(transfer);

            if (remainDebt.compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(new AbstractMap.SimpleEntry<>(debtor.getKey(), remainDebt));
            }
            if (remainCredit.compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(new AbstractMap.SimpleEntry<>(creditor.getKey(), remainCredit));
            }
        }

        return result;
    }

    @Transactional
    public void settle(Long groupId, Long fromUserId, Long toUserId, BigDecimal amount) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        User fromUser = userRepository.findById(fromUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User toUser = userRepository.findById(toUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        paymentRepository.save(Payment.builder()
            .group(group)
            .fromUser(fromUser)
            .toUser(toUser)
            .amount(amount)
            .build());
    }
}
