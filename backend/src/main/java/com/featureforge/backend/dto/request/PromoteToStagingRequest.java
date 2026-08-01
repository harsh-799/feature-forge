package com.featureforge.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import java.util.UUID;

@Getter
public class PromoteToStagingRequest {
    @NotNull(message = "workspaceId can't be null")
    private UUID workspaceID;
}
