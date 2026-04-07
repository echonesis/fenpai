package com.fenpai.controller;

import com.fenpai.config.JwtUtil;
import com.fenpai.model.AuthProvider;
import com.fenpai.model.User;
import com.fenpai.service.GoogleTokenService;
import com.fenpai.service.InvitationService;
import com.fenpai.service.UserService;
import com.fenpai.service.ExternalIdentityService;
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
    private final ExternalIdentityService externalIdentityService;
    private final GoogleTokenService googleTokenService;
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

    record GoogleLoginRequest(
        @NotBlank String credential
    ) {}

    record AuthResponse(Long id, String name, String email, String token, boolean hasPassword, java.util.List<String> providers) {
        static AuthResponse from(User user, String token, UserService userService) {
            return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                token,
                userService.hasPassword(user),
                userService.getProviderNames(user)
            );
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        User user = userService.register(req.name(), req.email(), req.password());
        invitationService.autoAcceptPendingInvitations(user.getEmail());
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "hasPassword", user.hasPassword(),
            "providers", userService.getProviderNames(user)
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        userService.ensurePasswordLoginAllowed(req.email());
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );
        String token = jwtUtil.generateToken(auth.getName());
        User user = userService.findByEmail(auth.getName());
        return ResponseEntity.ok(AuthResponse.from(user, token, userService));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest req) {
        GoogleTokenService.GoogleProfile profile = googleTokenService.verify(req.credential());
        User user = externalIdentityService.resolveOrCreateUser(
            AuthProvider.GOOGLE,
            profile.subject(),
            profile.email(),
            profile.name(),
            profile.emailVerified(),
            profile.authoritativeEmail()
        );
        invitationService.autoAcceptPendingInvitations(user.getEmail());
        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(AuthResponse.from(user, token, userService));
    }
}
