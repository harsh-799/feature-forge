package com.featureforge.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.UUID;

@Getter
public class FeatureUpdationRequest {
    private String name;
    private String description;
    @NotNull(message = "Workspace ID is required")
    private UUID workspaceId;
}
