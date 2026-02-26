package com.fenpai.controller;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    record UpdateProfileRequest(
        @NotBlank String name,
        String password
    ) {}

    // TODO: 取得目前登入用戶資料（從 JWT 解析）
    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    // TODO: 更新個人資料（name、password）
    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody UpdateProfileRequest req) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
