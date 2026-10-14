package com.buildtrack.dto.request;

public class UserUpdateRequest {

    private String name;
    private String email;
    private String role;
    private String phone;
    private String avatar;

    // NOTE: no `password` field here on purpose — a user's password must
    // never be changed through this generic admin-editing endpoint, just
    // like the Node backend's validateUserUpdate strips it from req.body.

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
