package com.buildtrack.controller;

import com.buildtrack.dto.request.UserUpdateRequest;
import com.buildtrack.dto.response.UserResponse;
import com.buildtrack.model.User;
import com.buildtrack.security.AuthorizationUtil;
import com.buildtrack.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Every endpoint here is admin-only, mirroring the Node routes/users.js
 * (`router.use(protect); router.get('/', authorize('admin'), ...)` etc).
 * This is also the ONLY way a user's role can change (Client → Engineer/Admin),
 * enforced by requireRole(currentUser, "admin") on every method — see item 1
 * of the security fixes: registration can never grant elevated roles, but an
 * existing admin can, right here.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Map<String, Object> getUsers(@AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin");
        return Map.of("users", userService.getUsers());
    }

    @GetMapping("/{id}")
    public Map<String, Object> getUser(@PathVariable String id, @AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin");
        return Map.of("user", userService.getUser(id));
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateUser(@PathVariable String id, @RequestBody UserUpdateRequest req,
                                           @AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin");
        UserResponse updated = userService.updateUser(id, req);
        return Map.of("user", updated);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteUser(@PathVariable String id, @AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin");
        userService.deleteUser(id);
        return Map.of("message", "User deleted");
    }
}
