package com.featureforge.backend.exception;

public class WorkspaceMismatchException extends RuntimeException {
    public WorkspaceMismatchException(String message) {
        super(message);
    }
}
