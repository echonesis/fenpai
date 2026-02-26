package com.fenpai.service;

import com.fenpai.model.*;
import com.fenpai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final GroupInvitationRepository invitationRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    /**
     * Invite an email to a group.
     * - If already a member: throw
     * - If user exists: add directly, return "added"
     * - If user doesn't exist: create invitation + send email, return "invited"
     */
    @Transactional
    public String inviteToGroup(Long groupId, String targetEmail, String inviterEmail) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        User inviter = userRepository.findByEmail(inviterEmail)
            .orElseThrow(() -> new IllegalArgumentException("Inviter not found"));

        // Check if user is already a member
        var existingUser = userRepository.findByEmail(targetEmail);
        if (existingUser.isPresent()) {
            Long userId = existingUser.get().getId();
            if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
                throw new IllegalArgumentException("User already in group");
            }
            GroupMember member = GroupMember.builder()
                .group(group)
                .user(existingUser.get())
                .build();
            groupMemberRepository.save(member);
            return "added";
        }

        // User not registered — create invitation if not already pending
        if (invitationRepository.existsByGroupIdAndEmailAndAcceptedFalse(groupId, targetEmail)) {
            throw new IllegalArgumentException("Invitation already sent to this email");
        }

        String token = UUID.randomUUID().toString().replace("-", "");
        GroupInvitation invitation = GroupInvitation.builder()
            .group(group)
            .email(targetEmail)
            .token(token)
            .invitedBy(inviter)
            .accepted(false)
            .expiresAt(LocalDateTime.now().plusDays(7))
            .build();
        invitationRepository.save(invitation);

        String inviteLink = frontendBaseUrl + "/invite/" + token;
        emailService.sendInvitation(targetEmail, inviter.getName(), group.getName(), inviteLink);

        return "invited";
    }

    /**
     * Accept invitation — add current user to the group.
     */
    @Transactional
    public String acceptInvitation(String token, String userEmail) {
        GroupInvitation invitation = invitationRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));

        if (invitation.isAccepted()) {
            throw new IllegalArgumentException("Invitation already accepted");
        }
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invitation expired");
        }

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long groupId = invitation.getGroup().getId();
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, user.getId())) {
            GroupMember member = GroupMember.builder()
                .group(invitation.getGroup())
                .user(user)
                .build();
            groupMemberRepository.save(member);
        }

        invitation.setAccepted(true);
        invitationRepository.save(invitation);

        return invitation.getGroup().getName();
    }

    /**
     * On registration, auto-accept all pending invitations for the new user's email.
     */
    @Transactional
    public void autoAcceptPendingInvitations(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        invitationRepository.findByEmailAndAcceptedFalse(email).forEach(inv -> {
            if (inv.getExpiresAt().isAfter(LocalDateTime.now())) {
                Long groupId = inv.getGroup().getId();
                if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, user.getId())) {
                    GroupMember member = GroupMember.builder()
                        .group(inv.getGroup())
                        .user(user)
                        .build();
                    groupMemberRepository.save(member);
                }
                inv.setAccepted(true);
                invitationRepository.save(inv);
            }
        });
    }

    /** Get basic invitation info (for frontend display before accepting). */
    public record InvitationInfo(String groupName, String inviterName, boolean expired) {}

    @Transactional(readOnly = true)
    public InvitationInfo getInvitationInfo(String token) {
        GroupInvitation inv = invitationRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));
        boolean expired = inv.getExpiresAt().isBefore(LocalDateTime.now()) || inv.isAccepted();
        return new InvitationInfo(inv.getGroup().getName(), inv.getInvitedBy().getName(), expired);
    }
}
