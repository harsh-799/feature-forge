package com.featureforge.backend.exception;

public class FeatureAlreadyExistsException extends RuntimeException {
    public FeatureAlreadyExistsException(String message) {
        super(message);
    }
}
