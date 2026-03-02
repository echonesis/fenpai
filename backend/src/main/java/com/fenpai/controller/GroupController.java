package com.fenpai.controller;

import com.fenpai.model.Group;
import com.fenpai.model.User;
import com.fenpai.service.GroupService;
import com.fenpai.service.InvitationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final InvitationService invitationService;

    record CreateGroupRequest(@NotBlank String name) {}
    record InviteRequest(@NotBlank @Email String email) {}

    record GroupResponse(Long id, String name, Long createdById) {
        static GroupResponse from(Group g) {
            return new GroupResponse(g.getId(), g.getName(), g.getCreatedBy().getId());
        }
    }

    record MemberResponse(Long id, String name, String email) {
        static MemberResponse from(User u) { return new MemberResponse(u.getId(), u.getName(), u.getEmail()); }
    }

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
            @Valid @RequestBody CreateGroupRequest req, Principal principal) {
        User user = groupService.getUserByEmail(principal.getName());
        Group group = groupService.createGroup(req.name(), user.getId());
        return ResponseEntity.ok(GroupResponse.from(group));
    }

    @GetMapping
    public ResponseEntity<List<GroupResponse>> getMyGroups(Principal principal) {
        User user = groupService.getUserByEmail(principal.getName());
        List<GroupResponse> groups = groupService.getGroupsForUser(user.getId())
            .stream().map(GroupResponse::from).toList();
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponse> getGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(GroupResponse.from(groupService.getGroupById(groupId)));
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<MemberResponse>> getMembers(@PathVariable Long groupId) {
        List<MemberResponse> members = groupService.getMembers(groupId)
            .stream().map(MemberResponse::from).toList();
        return ResponseEntity.ok(members);
    }

    @PostMapping("/{groupId}/invite")
    public ResponseEntity<Map<String, String>> invite(
            @PathVariable Long groupId,
            @Valid @RequestBody InviteRequest req,
            Principal principal) {
        String result = invitationService.inviteToGroup(groupId, req.email(), principal.getName());
        return ResponseEntity.ok(Map.of("result", result));
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<GroupResponse> updateGroup(
            @PathVariable Long groupId,
            @Valid @RequestBody CreateGroupRequest req,
            Principal principal) {
        Group group = groupService.updateGroupName(groupId, principal.getName(), req.name());
        return ResponseEntity.ok(GroupResponse.from(group));
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long groupId, Principal principal) {
        groupService.deleteGroup(groupId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            Principal principal) {
        groupService.removeMember(groupId, userId, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
