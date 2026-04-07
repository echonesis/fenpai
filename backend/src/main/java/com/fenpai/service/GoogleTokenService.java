package com.fenpai.service;

import com.fenpai.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoogleTokenService {

    private final AppProperties appProperties;

    public GoogleProfile verify(String credential) {
        String clientId = appProperties.getAuth().getGoogle().getClientId();
        if (clientId == null || clientId.isBlank()) {
            throw new IllegalStateException("Google auth is not configured");
        }

        NimbusJwtDecoder decoder = NimbusJwtDecoder
            .withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
            .build();

        OAuth2TokenValidator<Jwt> validator = new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefault(),
            jwt -> validateIssuer(jwt),
            jwt -> {
                List<String> audience = jwt.getAudience();
                if (audience != null && audience.contains(clientId)) {
                    return OAuth2TokenValidatorResult.success();
                }
                return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Invalid Google audience", null)
                );
            }
        );
        decoder.setJwtValidator(validator);

        Jwt jwt;
        try {
            jwt = decoder.decode(credential);
        } catch (BadJwtException ex) {
            throw new IllegalArgumentException(ex.getMessage());
        } catch (JwtException ex) {
            throw new IllegalArgumentException("Invalid Google credential");
        }

        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");
        String subject = jwt.getSubject();
        Boolean emailVerified = jwt.getClaimAsBoolean("email_verified");
        String hostedDomain = jwt.getClaimAsString("hd");

        if (email == null || email.isBlank() || subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("Google account is missing required profile fields");
        }

        boolean authoritativeEmail = email.endsWith("@gmail.com")
            || (Boolean.TRUE.equals(emailVerified) && hostedDomain != null && !hostedDomain.isBlank());

        return new GoogleProfile(
            subject,
            email.trim(),
            (name == null || name.isBlank()) ? email : name.trim(),
            Boolean.TRUE.equals(emailVerified),
            authoritativeEmail
        );
    }

    public record GoogleProfile(
        String subject,
        String email,
        String name,
        boolean emailVerified,
        boolean authoritativeEmail
    ) {}

    private OAuth2TokenValidatorResult validateIssuer(Jwt jwt) {
        String issuer = jwt.getIssuer() != null ? jwt.getIssuer().toString() : null;
        if ("https://accounts.google.com".equals(issuer) || "accounts.google.com".equals(issuer)) {
            return OAuth2TokenValidatorResult.success();
        }
        return OAuth2TokenValidatorResult.failure(
            new OAuth2Error("invalid_token", "Invalid Google issuer", null)
        );
    }
}
