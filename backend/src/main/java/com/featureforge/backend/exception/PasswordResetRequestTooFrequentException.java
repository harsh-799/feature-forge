package com.featureforge.backend.exception;

public class PasswordResetRequestTooFrequentException extends RuntimeException {
    public PasswordResetRequestTooFrequentException(String message) {
        super(message);
    }
}
