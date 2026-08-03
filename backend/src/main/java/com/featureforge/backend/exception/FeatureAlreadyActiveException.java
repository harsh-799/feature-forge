package com.featureforge.backend.exception;

public class FeatureAlreadyActiveException extends RuntimeException {
    public FeatureAlreadyActiveException(String message) {
        super(message);
    }
}
