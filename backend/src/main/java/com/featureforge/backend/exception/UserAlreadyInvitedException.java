package com.featureforge.backend.exception;

public class UserAlreadyInvitedException extends RuntimeException {
    public UserAlreadyInvitedException(String message) {
        super(message);
    }
}
