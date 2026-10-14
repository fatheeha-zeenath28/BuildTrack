package com.buildtrack.dto.response;

import com.buildtrack.model.User;

/**
 * This is the Spring equivalent of Mongoose's `.populate('field', 'name email')`.
 * Since MongoDB (even via Spring Data) doesn't auto-join references the way
 * a relational ORM would, each *Service builds these by looking up the
 * referenced User id(s) itself and mapping them into the response — same
 * idea as the Node controllers' `.populate(...)` calls, just done in Java.
 */
public class UserSummary {
    private String id;
    private String name;
    private String email;
    private String role;

    public static UserSummary from(User u) {
        if (u == null) return null;
        UserSummary s = new UserSummary();
        s.id = u.getId();
        s.name = u.getName();
        s.email = u.getEmail();
        s.role = u.getRole();
        return s;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
}
