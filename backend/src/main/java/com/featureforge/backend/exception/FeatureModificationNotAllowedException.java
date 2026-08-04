package com.featureforge.backend.exception;

public class FeatureModificationNotAllowedException extends RuntimeException {
    public FeatureModificationNotAllowedException(String message) {
        super(message);
    }
}
