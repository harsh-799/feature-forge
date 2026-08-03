package com.featureforge.backend.exception;

public class InvalidFeatureStatusException extends RuntimeException {
    public InvalidFeatureStatusException(String message) {
        super(message);
    }
}
