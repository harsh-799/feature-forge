package com.featureforge.backend.exception;

public class InvalidInviteTokenException extends RuntimeException {
    public InvalidInviteTokenException(String message) {
        super(message);
    }
}
