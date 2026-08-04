package com.featureforge.backend.exception;

public class InvalidFeatureUpdateRequestException extends RuntimeException {
    public InvalidFeatureUpdateRequestException(String message) {
        super(message);
    }
}
