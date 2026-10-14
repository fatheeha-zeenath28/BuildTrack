package com.buildtrack.dto.response;

import com.buildtrack.model.User;

import java.time.Instant;

/** Never includes the password hash — equivalent of User.toJSON() in the Node model. */
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String avatar;
    private Instant createdAt;
    private Instant updatedAt;

    public static UserResponse from(User u) {
        if (u == null) return null;
        UserResponse r = new UserResponse();
        r.id = u.getId();
        r.name = u.getName();
        r.email = u.getEmail();
        r.role = u.getRole();
        r.phone = u.getPhone();
        r.avatar = u.getAvatar();
        r.createdAt = u.getCreatedAt();
        r.updatedAt = u.getUpdatedAt();
        return r;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getPhone() { return phone; }
    public String getAvatar() { return avatar; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
