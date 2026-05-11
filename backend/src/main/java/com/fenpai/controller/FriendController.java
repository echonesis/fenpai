package com.fenpai.controller;

import com.fenpai.model.User;
import com.fenpai.service.FriendService;
import com.fenpai.service.GroupService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;
    private final GroupService groupService;

    record AddFriendRequest(@NotNull Long friendId) {}

    @GetMapping
    public ResponseEntity<List<FriendService.FriendBalanceDto>> getFriends(Principal principal) {
        User user = groupService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(friendService.getFriendsWithBalances(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Void> addFriend(@Valid @RequestBody AddFriendRequest req, Principal principal) {
        User user = groupService.getUserByEmail(principal.getName());
        friendService.addFriend(user.getId(), req.friendId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(@PathVariable Long friendId, Principal principal) {
        User user = groupService.getUserByEmail(principal.getName());
        friendService.removeFriend(user.getId(), friendId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{friendId}/history")
    public ResponseEntity<List<FriendService.HistoryItem>> getHistory(
            @PathVariable Long friendId, Principal principal) {
        User user = groupService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(friendService.getHistory(user.getId(), friendId));
    }
}
