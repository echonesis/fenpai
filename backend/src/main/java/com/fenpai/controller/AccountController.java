package com.fenpai.controller;

import com.fenpai.model.Account;
import com.fenpai.service.AccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    record CreateAccountRequest(
        @NotBlank String label,
        @NotBlank String bankCode,
        @NotBlank String accountNumber
    ) {}

    record AccountResponse(Long id, String label, String bankCode, String accountNumber) {
        static AccountResponse from(Account a) {
            return new AccountResponse(a.getId(), a.getLabel(), a.getBankCode(), a.getAccountNumber());
        }
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAccounts(Principal principal) {
        List<AccountResponse> accounts = accountService.getAccounts(principal.getName())
            .stream().map(AccountResponse::from).toList();
        return ResponseEntity.ok(accounts);
    }

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
        @Valid @RequestBody CreateAccountRequest req, Principal principal) {
        Account account = accountService.createAccount(
            principal.getName(), req.label(), req.bankCode(), req.accountNumber()
        );
        return ResponseEntity.ok(AccountResponse.from(account));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id, Principal principal) {
        accountService.deleteAccount(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
