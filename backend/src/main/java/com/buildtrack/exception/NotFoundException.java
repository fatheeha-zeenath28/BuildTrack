package com.buildtrack.exception;

/** Thrown when a resource looked up by id doesn't exist. Mapped to HTTP 404. */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
