package com.fenpai.service;

import com.fenpai.model.Expense;
import com.fenpai.model.Friendship;
import com.fenpai.model.Payment;
import com.fenpai.model.User;
import com.fenpai.repository.ExpenseRepository;
import com.fenpai.repository.ExpenseSplitRepository;
import com.fenpai.repository.FriendshipRepository;
import com.fenpai.repository.PaymentRepository;
import com.fenpai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;

    public record FriendBalanceDto(Long friendId, String name, String email, BigDecimal balance) {}

    public record BalanceSummaryDto(BigDecimal totalOwedToMe, BigDecimal totalIOwe,
                                    List<FriendBalanceDto> friends) {}

    public record HistoryItem(
        String type,           // "EXPENSE" | "PAYMENT"
        Long id,
        String description,
        BigDecimal amount,
        Long paidById,
        String paidByName,
        Long fromUserId,
        String fromUserName,
        Long toUserId,
        String toUserName,
        String groupName,
        String createdAt
    ) {}

    @Transactional(readOnly = true)
    public List<FriendBalanceDto> getFriendsWithBalances(Long userId) {
        return friendshipRepository.findByUserId(userId).stream()
            .map(f -> {
                User friend = f.getFriend();
                BigDecimal balance = computeNetBalance(userId, friend.getId());
                return new FriendBalanceDto(friend.getId(), friend.getName(), friend.getEmail(), balance);
            })
            .toList();
    }

    @Transactional(readOnly = true)
    public BalanceSummaryDto getSummary(Long userId) {
        List<FriendBalanceDto> friends = getFriendsWithBalances(userId);
        BigDecimal totalOwedToMe = friends.stream()
            .map(FriendBalanceDto::balance)
            .filter(b -> b.compareTo(BigDecimal.ZERO) > 0)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalIOwe = friends.stream()
            .map(FriendBalanceDto::balance)
            .filter(b -> b.compareTo(BigDecimal.ZERO) < 0)
            .map(BigDecimal::negate)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new BalanceSummaryDto(totalOwedToMe, totalIOwe, friends);
    }

    @Transactional
    public void addFriend(Long userId, Long friendId) {
        if (userId.equals(friendId)) {
            throw new IllegalArgumentException("Cannot add yourself as a friend");
        }
        userRepository.findById(friendId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (friendshipRepository.existsByUserIdAndFriendId(userId, friendId)) {
            throw new IllegalArgumentException("Already friends");
        }
        User user   = userRepository.getReferenceById(userId);
        User friend = userRepository.getReferenceById(friendId);
        friendshipRepository.save(Friendship.builder().user(user).friend(friend).build());
        friendshipRepository.save(Friendship.builder().user(friend).friend(user).build());
    }

    @Transactional
    public void removeFriend(Long userId, Long friendId) {
        friendshipRepository.findByUserIdAndFriendId(userId, friendId)
            .ifPresent(friendshipRepository::delete);
        friendshipRepository.findByUserIdAndFriendId(friendId, userId)
            .ifPresent(friendshipRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<HistoryItem> getHistory(Long userId, Long friendId) {
        List<HistoryItem> items = new ArrayList<>();

        for (Expense e : expenseRepository.findExpensesBetweenUsers(userId, friendId)) {
            items.add(new HistoryItem(
                "EXPENSE", e.getId(), e.getDescription(), e.getAmount(),
                e.getPaidBy().getId(), e.getPaidBy().getName(),
                null, null, null, null,
                e.getGroup() != null ? e.getGroup().getName() : null,
                e.getCreatedAt().toString()
            ));
        }

        for (Payment p : paymentRepository.findBetweenUsers(userId, friendId)) {
            items.add(new HistoryItem(
                "PAYMENT", p.getId(), p.getNote(), p.getAmount(),
                null, null,
                p.getFromUser().getId(), p.getFromUser().getName(),
                p.getToUser().getId(), p.getToUser().getName(),
                null,
                p.getCreatedAt().toString()
            ));
        }

        items.sort(Comparator.comparing(HistoryItem::createdAt).reversed());
        return items;
    }

    // positive = friend owes me; negative = I owe friend
    private BigDecimal computeNetBalance(Long userId, Long friendId) {
        BigDecimal friendOwesMe = expenseSplitRepository.sumAmountOwed(userId, friendId);
        BigDecimal iOweFriend   = expenseSplitRepository.sumAmountOwed(friendId, userId);
        BigDecimal paidByFriend = paymentRepository.sumPaymentsBetween(friendId, userId);
        BigDecimal paidByMe     = paymentRepository.sumPaymentsBetween(userId, friendId);
        return friendOwesMe.subtract(iOweFriend).subtract(paidByFriend).add(paidByMe);
    }
}
