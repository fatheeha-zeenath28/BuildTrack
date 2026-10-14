package com.buildtrack.controller;

import com.buildtrack.dto.request.LoginRequest;
import com.buildtrack.dto.request.RegisterRequest;
import com.buildtrack.dto.response.AuthResponse;
import com.buildtrack.dto.response.UserResponse;
import com.buildtrack.model.User;
import com.buildtrack.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public Map<String, UserResponse> me(@AuthenticationPrincipal User currentUser) {
        return Map.of("user", UserResponse.from(currentUser));
    }
}
