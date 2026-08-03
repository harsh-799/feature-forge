package com.featureforge.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class FeatureEvaluationRequest {

    @NotBlank(message = "featureKey can't be empty")
    private String featureKey;

    @NotBlank(message = "user can't be empty")
    private String user;
}
