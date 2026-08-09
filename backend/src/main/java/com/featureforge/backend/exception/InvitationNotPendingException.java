package com.featureforge.backend.exception;

public class InvitationNotPendingException extends RuntimeException {
    public InvitationNotPendingException(String message) {
        super(message);
    }
}
