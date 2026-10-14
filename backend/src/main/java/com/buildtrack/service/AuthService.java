package com.buildtrack.service;

import com.buildtrack.dto.request.LoginRequest;
import com.buildtrack.dto.request.RegisterRequest;
import com.buildtrack.dto.response.AuthResponse;
import com.buildtrack.dto.response.UserResponse;
import com.buildtrack.exception.UnauthorizedException;
import com.buildtrack.exception.ValidationException;
import com.buildtrack.model.User;
import com.buildtrack.repository.UserRepository;
import com.buildtrack.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByEmail(req.getEmail().toLowerCase()).isPresent()) {
            throw new ValidationException(List.of("Email already registered"));
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(req.getPassword()));

        // SECURITY: role is never taken from the request. Every account
        // created through public registration is forced to the
        // lowest-privilege role. An admin can promote a user later via
        // UserService.updateUser (PUT /api/users/:id, admin-only).
        user.setRole(User.ROLE_CLIENT);

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getId());
        return new AuthResponse(token, UserResponse.from(saved));
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId());
        return new AuthResponse(token, UserResponse.from(user));
    }
}
