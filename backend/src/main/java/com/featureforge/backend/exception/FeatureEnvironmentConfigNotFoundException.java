package com.featureforge.backend.exception;

public class FeatureEnvironmentConfigNotFoundException extends RuntimeException {
    public FeatureEnvironmentConfigNotFoundException(String message) {
        super(message);
    }
}
