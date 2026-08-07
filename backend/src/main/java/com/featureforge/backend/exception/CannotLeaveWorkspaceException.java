package com.featureforge.backend.exception;

public class CannotLeaveWorkspaceException extends RuntimeException {
    public CannotLeaveWorkspaceException(String message) {
        super(message);
    }
}
