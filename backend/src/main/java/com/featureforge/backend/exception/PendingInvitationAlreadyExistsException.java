package com.featureforge.backend.exception;

public class PendingInvitationAlreadyExistsException extends RuntimeException {
    public PendingInvitationAlreadyExistsException(String message) {
        super(message);
    }
}
