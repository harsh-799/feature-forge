package com.featureforge.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
public class FeatureEnvironmentToggleRequest {
    @NotNull(message = "Workspace ID is required")
    private UUID workspaceId;

    @NotNull(message = "Enabled state is required")
    private Boolean enabled;
}
