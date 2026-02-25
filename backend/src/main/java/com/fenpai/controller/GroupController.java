package com.fenpai.controller;

import com.fenpai.model.Group;
import com.fenpai.model.GroupMember;
import com.fenpai.service.GroupService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    record CreateGroupRequest(@NotBlank String name, @NotNull Long createdByUserId) {}
    record AddMemberRequest(@NotNull Long userId) {}

    @PostMapping
    public ResponseEntity<Group> createGroup(@Valid @RequestBody CreateGroupRequest req) {
        return ResponseEntity.ok(groupService.createGroup(req.name(), req.createdByUserId()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Group>> getGroupsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(groupService.getGroupsForUser(userId));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<Group> getGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupById(groupId));
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<GroupMember> addMember(@PathVariable Long groupId,
                                                  @Valid @RequestBody AddMemberRequest req) {
        return ResponseEntity.ok(groupService.addMember(groupId, req.userId()));
    }
}
