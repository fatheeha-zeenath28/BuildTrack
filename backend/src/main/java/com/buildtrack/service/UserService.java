package com.buildtrack.service;

import com.buildtrack.dto.request.UserUpdateRequest;
import com.buildtrack.dto.response.UserResponse;
import com.buildtrack.exception.NotFoundException;
import com.buildtrack.exception.ValidationException;
import com.buildtrack.model.User;
import com.buildtrack.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getUsers() {
        return userRepository.findAllByOrderByNameAsc().stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse getUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return UserResponse.from(user);
    }

    public UserResponse updateUser(String id, UserUpdateRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        List<String> errors = new ArrayList<>();

        if (req.getRole() != null) {
            if (!List.of(User.ROLE_ADMIN, User.ROLE_ENGINEER, User.ROLE_CLIENT).contains(req.getRole())) {
                errors.add("role must be one of: admin, engineer, client");
            }
        }
        if (req.getEmail() != null) {
            if (req.getEmail().isBlank() || !req.getEmail().matches("^\\S+@\\S+\\.\\S+$")) {
                errors.add("email must be valid");
            }
        }
        if (req.getName() != null && req.getName().isBlank()) {
            errors.add("name cannot be empty");
        }
        if (!errors.isEmpty()) throw new ValidationException(errors);

        if (req.getName() != null) user.setName(req.getName());
        if (req.getEmail() != null) user.setEmail(req.getEmail().toLowerCase());
        if (req.getRole() != null) user.setRole(req.getRole());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getAvatar() != null) user.setAvatar(req.getAvatar());

        User saved = userRepository.save(user);
        return UserResponse.from(saved);
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) throw new NotFoundException("User not found");
        userRepository.deleteById(id);
    }
}
