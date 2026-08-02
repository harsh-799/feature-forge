package com.featureforge.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
public class FeatureQARejectionRequest {
    @NotNull(message = "workspace Id can't be null")
    private UUID workspaceId;
}
