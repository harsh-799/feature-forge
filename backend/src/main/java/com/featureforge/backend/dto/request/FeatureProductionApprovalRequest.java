package com.featureforge.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.UUID;

@Getter
public class FeatureProductionApprovalRequest {
    @NotNull(message = "workspace can't be null")
    private UUID workspaceId;
}
