package com.fenpai.service;

import com.fenpai.model.*;
import com.fenpai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    @Transactional
    public Group createGroup(String name, Long createdByUserId) {
        User creator = userRepository.findById(createdByUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Group group = Group.builder()
            .name(name)
            .createdBy(creator)
            .build();
        group = groupRepository.save(group);
        GroupMember member = GroupMember.builder()
            .group(group)
            .user(creator)
            .build();
        groupMemberRepository.save(member);
        return group;
    }

    @Transactional(readOnly = true)
    public List<Group> getGroupsForUser(Long userId) {
        return groupRepository.findGroupsByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Group getGroupById(Long groupId) {
        return groupRepository.findById(groupId)
            .orElseThrow(() -> new IllegalArgumentException("Group not found: " + groupId));
    }

    @Transactional(readOnly = true)
    public List<User> getMembers(Long groupId) {
        groupRepository.findById(groupId)
            .orElseThrow(() -> new IllegalArgumentException("Group not found: " + groupId));
        return groupMemberRepository.findUsersByGroupId(groupId);
    }

    @Transactional
    public GroupMember addMember(Long groupId, Long userId) {
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new IllegalArgumentException("User already in group");
        }
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        GroupMember member = GroupMember.builder()
            .group(group)
            .user(user)
            .build();
        return groupMemberRepository.save(member);
    }
}
