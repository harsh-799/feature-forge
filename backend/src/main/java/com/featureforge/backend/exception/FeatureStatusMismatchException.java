package com.featureforge.backend.exception;

public class FeatureStatusMismatchException extends RuntimeException {
    public FeatureStatusMismatchException(String message) {
        super(message);
    }
}
