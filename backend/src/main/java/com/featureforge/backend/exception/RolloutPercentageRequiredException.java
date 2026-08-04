package com.featureforge.backend.exception;

public class RolloutPercentageRequiredException extends RuntimeException {
    public RolloutPercentageRequiredException(String message) {
        super(message);
    }
}
