package com.fenpai.controller;

import com.fenpai.config.JwtUtil;
import com.fenpai.model.User;
import com.fenpai.service.InvitationService;
import com.fenpai.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final InvitationService invitationService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    record RegisterRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password
    ) {}

    record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        User user = userService.register(req.name(), req.email(), req.password());
        invitationService.autoAcceptPendingInvitations(user.getEmail());
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );
        String token = jwtUtil.generateToken(auth.getName());
        User user = userService.findByEmail(auth.getName());
        return ResponseEntity.ok(Map.of(
            "token", token,
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail()
        ));
    }
}
