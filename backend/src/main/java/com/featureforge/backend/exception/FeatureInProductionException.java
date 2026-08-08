package com.featureforge.backend.exception;

public class FeatureInProductionException extends RuntimeException {
    public FeatureInProductionException(String message) {
        super(message);
    }
}
