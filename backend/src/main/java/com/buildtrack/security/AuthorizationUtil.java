package com.buildtrack.security;

import com.buildtrack.exception.ForbiddenException;
import com.buildtrack.model.User;

import java.util.Arrays;

/**
 * Equivalent of the Node backend's:
 *   exports.authorize = (...roles) => (req, res, next) => {
 *     if (!roles.includes(req.user.role)) return res.status(403)...
 *   };
 *
 * Called at the top of a controller method with the roles allowed for that
 * endpoint, e.g. AuthorizationUtil.requireRole(user, "admin").
 */
public final class AuthorizationUtil {

    private AuthorizationUtil() {}

    public static void requireRole(User user, String... allowedRoles) {
        if (Arrays.stream(allowedRoles).noneMatch(r -> r.equals(user.getRole()))) {
            throw new ForbiddenException("Role '" + user.getRole() + "' is not allowed here");
        }
    }
}
