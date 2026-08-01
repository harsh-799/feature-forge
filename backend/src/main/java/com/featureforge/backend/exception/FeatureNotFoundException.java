package com.featureforge.backend.exception;

public class FeatureNotFoundException extends RuntimeException {
    public FeatureNotFoundException(String message) {
        super(message);
    }
}
