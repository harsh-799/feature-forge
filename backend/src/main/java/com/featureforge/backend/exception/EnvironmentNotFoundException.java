package com.featureforge.backend.exception;

public class EnvironmentNotFoundException extends RuntimeException {
    public EnvironmentNotFoundException(String message) {
        super(message);
    }
}
