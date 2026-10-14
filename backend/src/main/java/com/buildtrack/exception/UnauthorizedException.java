package com.buildtrack.exception;

/** Thrown for authentication failures such as a bad login. Mapped to HTTP 401. */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
