package com.buildtrack.exception;

import java.util.List;

/**
 * Thrown by the manual field-level checks in the *Request DTOs / services
 * (required fields, numeric ranges, enum values, date validity — the same
 * checks the Node backend's middleware/validate.js performed). Mapped to
 * HTTP 400 with a `{ message, errors: [...] }` body, matching the previous
 * API's shape.
 */
public class ValidationException extends RuntimeException {
    private final List<String> errors;

    public ValidationException(List<String> errors) {
        super("Validation failed");
        this.errors = errors;
    }

    public List<String> getErrors() {
        return errors;
    }
}
