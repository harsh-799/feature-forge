package com.featureforge.backend.exception;

public class InvalidWorkspaceOperationException extends RuntimeException {
    public InvalidWorkspaceOperationException(String message) {
        super(message);
    }
}
