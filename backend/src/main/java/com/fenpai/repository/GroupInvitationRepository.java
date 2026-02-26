package com.fenpai.repository;

import com.fenpai.model.GroupInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupInvitationRepository extends JpaRepository<GroupInvitation, Long> {
    Optional<GroupInvitation> findByToken(String token);
    List<GroupInvitation> findByEmailAndAcceptedFalse(String email);
    boolean existsByGroupIdAndEmailAndAcceptedFalse(Long groupId, String email);
}
