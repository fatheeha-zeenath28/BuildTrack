package com.buildtrack.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "users")
public class User {

    public static final String ROLE_ADMIN = "admin";
    public static final String ROLE_ENGINEER = "engineer";
    public static final String ROLE_CLIENT = "client";

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    // Stored as a BCrypt hash. Never returned to the client — see
    // dto.response.UserResponse, which is what controllers actually send back.
    private String password;

    // One of "admin" | "engineer" | "client". Kept as a plain validated
    // String (validated in AuthService/UserService) to mirror the original
    // Mongoose `enum` field exactly, including its JSON casing.
    private String role = ROLE_CLIENT;

    private String phone;
    private String avatar;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public User() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
