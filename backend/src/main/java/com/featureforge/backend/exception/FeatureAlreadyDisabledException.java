package com.featureforge.backend.exception;

public class FeatureAlreadyDisabledException extends RuntimeException {
    public FeatureAlreadyDisabledException(String message) {
        super(message);
    }
}
