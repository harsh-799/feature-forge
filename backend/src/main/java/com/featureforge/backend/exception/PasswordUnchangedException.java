package com.featureforge.backend.exception;

public class PasswordUnchangedException extends RuntimeException {
    public PasswordUnchangedException(String message) {
        super(message);
    }
}
