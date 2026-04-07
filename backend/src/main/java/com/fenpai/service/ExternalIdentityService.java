package com.fenpai.service;

import com.fenpai.model.AuthProvider;
import com.fenpai.model.ExternalIdentity;
import com.fenpai.model.User;
import com.fenpai.repository.ExternalIdentityRepository;
import com.fenpai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExternalIdentityService {

    private final ExternalIdentityRepository externalIdentityRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AuthProvider> getProviders(Long userId) {
        return externalIdentityRepository.findByUserId(userId).stream()
            .map(ExternalIdentity::getProvider)
            .distinct()
            .toList();
    }

    @Transactional
    public User resolveOrCreateUser(
            AuthProvider provider,
            String providerSubject,
            String email,
            String name,
            boolean emailVerified,
            boolean canAutoLinkByEmail
    ) {
        Optional<ExternalIdentity> existingIdentity =
            externalIdentityRepository.findByProviderAndProviderSubject(provider, providerSubject);
        if (existingIdentity.isPresent()) {
            ExternalIdentity identity = existingIdentity.get();
            identity.setEmail(email);
            identity.setEmailVerified(emailVerified);
            Long userId = identity.getUser().getId();
            return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        }

        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent() && !canAutoLinkByEmail) {
            throw new IllegalArgumentException("An account with this email already exists. Sign in with your existing method first.");
        }

        User user = existingUser.orElseGet(() -> {
            User newUser = User.builder()
                .name(name)
                .email(email)
                .passwordHash(null)
                .build();
            return userRepository.save(newUser);
        });

        ExternalIdentity identity = ExternalIdentity.builder()
            .provider(provider)
            .providerSubject(providerSubject)
            .email(email)
            .emailVerified(emailVerified)
            .user(user)
            .build();
        externalIdentityRepository.save(identity);
        return user;
    }
}
