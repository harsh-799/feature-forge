package com.featureforge.backend.exception;

public class CannotRemoveLastAdminException extends RuntimeException {
    public CannotRemoveLastAdminException(String message) {
        super(message);
    }
}
