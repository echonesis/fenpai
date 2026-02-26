package com.fenpai.controller;

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

    record SettleRequest(
        @NotNull Long groupId,
        @NotNull Long paidByUserId,
        @NotNull Long paidToUserId,
        @NotNull @Positive BigDecimal amount
    ) {}

    // TODO: 計算群組內誰欠誰多少錢（簡化後的最少轉帳數）
    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupBalances(@PathVariable Long groupId) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    // TODO: 記錄一筆還款
    @PostMapping("/settle")
    public ResponseEntity<?> settle(@RequestBody SettleRequest req) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    // TODO: 查看群組還款紀錄
    @GetMapping("/group/{groupId}/history")
    public ResponseEntity<?> getSettlementHistory(@PathVariable Long groupId) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
