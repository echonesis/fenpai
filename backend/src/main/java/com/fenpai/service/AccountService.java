package com.fenpai.service;

import com.fenpai.model.Account;
import com.fenpai.model.User;
import com.fenpai.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserService userService;

    public List<Account> getAccounts(String email) {
        User user = userService.findByEmail(email);
        return accountRepository.findByUserId(user.getId());
    }

    @Transactional
    public Account createAccount(String email, String label, String bankCode, String accountNumber) {
        User user = userService.findByEmail(email);
        Account account = Account.builder()
            .user(user)
            .label(label)
            .bankCode(bankCode)
            .accountNumber(accountNumber)
            .build();
        return accountRepository.save(account);
    }

    @Transactional
    public void deleteAccount(String email, Long accountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));
        if (!account.getUser().getEmail().equals(email)) {
            throw new SecurityException("Not authorized to delete this account");
        }
        accountRepository.delete(account);
    }
}
