package com.buildtrack.exception;

/**
 * Thrown for authorization failures: either role-level (the equivalent of
 * the Node backend's authorize('admin', ...) middleware) or resource-level
 * (e.g. an engineer trying to edit a project they aren't assigned to).
 * Mapped to HTTP 403.
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
