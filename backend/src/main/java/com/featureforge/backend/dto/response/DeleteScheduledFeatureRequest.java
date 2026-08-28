package com.featureforge.backend.dto.response;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.UUID;

@Getter
public class DeleteScheduledFeatureRequest {
    @NotNull(message = "workspace Id can't be null")
    private UUID workspaceId;
}
