package com.featureforge.backend.exception;

public class UserNotInWorkspaceException extends RuntimeException {
    public UserNotInWorkspaceException(String message) {
        super(message);
    }
}
