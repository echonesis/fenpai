package com.fenpai.controller;

import com.fenpai.service.BalanceService;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/balances")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;

    record SettleRequest(
        @NotNull Long groupId,
        @NotNull Long fromUserId,
        @NotNull Long toUserId,
        @NotNull @Positive BigDecimal amount
    ) {}

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupBalances(@PathVariable Long groupId) {
        return ResponseEntity.ok(balanceService.calculateBalances(groupId));
    }

    @PostMapping("/settle")
    public ResponseEntity<?> settle(@RequestBody SettleRequest req) {
        balanceService.settle(req.groupId(), req.fromUserId(), req.toUserId(), req.amount());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/group/{groupId}/history")
    public ResponseEntity<?> getSettlementHistory(@PathVariable Long groupId) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
