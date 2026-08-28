package com.featureforge.backend.exception;

public class InvalidScheduleStatusException extends RuntimeException {
    public InvalidScheduleStatusException(String message) {
        super(message);
    }
}
