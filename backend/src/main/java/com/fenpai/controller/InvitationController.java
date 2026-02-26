package com.fenpai.controller;

import com.fenpai.service.InvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/invite")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    /** Public — frontend shows group name + inviter before user logs in. */
    @GetMapping("/{token}")
    public ResponseEntity<InvitationService.InvitationInfo> getInfo(@PathVariable String token) {
        return ResponseEntity.ok(invitationService.getInvitationInfo(token));
    }

    /** Requires auth — logged-in user accepts the invitation. */
    @PostMapping("/{token}/accept")
    public ResponseEntity<Map<String, String>> accept(
            @PathVariable String token, Principal principal) {
        String groupName = invitationService.acceptInvitation(token, principal.getName());
        return ResponseEntity.ok(Map.of("groupName", groupName));
    }
}
