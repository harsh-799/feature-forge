package com.featureforge.backend.exception;

public class UnchangedRolloutPercentageException extends RuntimeException {
    public UnchangedRolloutPercentageException(String message) {
        super(message);
    }
}
