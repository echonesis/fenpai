package com.fenpai.controller;

import com.fenpai.model.User;
import com.fenpai.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    record UpdateProfileRequest(
        String name,
        String currentPassword,
        String password
    ) {}

    record UserResponse(Long id, String name, String email, boolean hasPassword, java.util.List<String> providers) {
        static UserResponse from(User u, UserService userService) {
            return new UserResponse(
                u.getId(),
                u.getName(),
                u.getEmail(),
                userService.hasPassword(u),
                userService.getProviderNames(u)
            );
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Principal principal) {
        User user = userService.findByEmail(principal.getName());
        return ResponseEntity.ok(UserResponse.from(user, userService));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            @RequestBody UpdateProfileRequest req,
            Principal principal) {
        User user = userService.updateMe(
            principal.getName(),
            req.name(),
            req.currentPassword(),
            req.password()
        );
        return ResponseEntity.ok(UserResponse.from(user, userService));
    }
}
