package com.fenpai.repository;

import com.fenpai.model.AuthProvider;
import com.fenpai.model.ExternalIdentity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExternalIdentityRepository extends JpaRepository<ExternalIdentity, Long> {
    Optional<ExternalIdentity> findByProviderAndProviderSubject(AuthProvider provider, String providerSubject);
    List<ExternalIdentity> findByUserId(Long userId);
}
