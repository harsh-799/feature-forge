package com.featureforge.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.UUID;

@Getter
public class FeatureProductionRolloutRequest {
    @NotNull(message = "workspace Id can't be null")
    private UUID workspaceId;

    @NotNull(message = "Rollout percentage is required")
    @Min(value = 1, message = "Rollout percentage must be at least 1")
    @Max(value = 100, message = "Rollout percentage cannot exceed 100")
    private Integer rolloutPercentage;
}
