package com.fenpai.controller;

import com.fenpai.model.User;
import com.fenpai.service.BalanceService;
import com.fenpai.service.FriendService;
import com.fenpai.service.GroupService;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;

@RestController
@RequestMapping("/api/balances")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;
    private final FriendService friendService;
    private final GroupService groupService;

    record SettleRequest(
        Long groupId,
        @NotNull Long fromUserId,
        @NotNull Long toUserId,
        @NotNull @Positive BigDecimal amount,
        String note
    ) {}

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupBalances(@PathVariable Long groupId) {
        return ResponseEntity.ok(balanceService.calculateBalances(groupId));
    }

    @PostMapping("/settle")
    public ResponseEntity<?> settle(@RequestBody SettleRequest req) {
        balanceService.settle(req.groupId(), req.fromUserId(), req.toUserId(), req.amount(), req.note());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/group/{groupId}/history")
    public ResponseEntity<?> getSettlementHistory(@PathVariable Long groupId) {
        return ResponseEntity.ok(balanceService.getPaymentHistory(groupId));
    }

    @GetMapping("/summary")
    public ResponseEntity<FriendService.BalanceSummaryDto> getSummary(Principal principal) {
        User user = groupService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(friendService.getSummary(user.getId()));
    }
}
