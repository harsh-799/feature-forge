package com.featureforge.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import java.util.UUID;

@Getter
public class FeatureDeletionRequest {
    @NotNull(message = "Workspace ID is required")
    private UUID workspaceId;
}
