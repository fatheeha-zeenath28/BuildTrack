package com.buildtrack.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Note there is intentionally NO "role" field here. Just like the fixed
 * Node backend, public self-registration always creates a "client"
 * account; the role is set server-side in AuthService, not read from the
 * request, even if a client sends one.
 */
public class RegisterRequest {

    @NotBlank(message = "name is required")
    private String name;

    @NotBlank(message = "a valid email is required")
    @Email(message = "a valid email is required")
    private String email;

    @NotBlank(message = "password must be at least 6 characters")
    @Size(min = 6, message = "password must be at least 6 characters")
    private String password;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
