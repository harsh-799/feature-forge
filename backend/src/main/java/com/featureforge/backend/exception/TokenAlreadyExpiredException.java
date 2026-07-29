package com.featureforge.backend.exception;

public class TokenAlreadyExpiredException extends RuntimeException {
    public TokenAlreadyExpiredException(String message) {
        super(message);
    }
}
