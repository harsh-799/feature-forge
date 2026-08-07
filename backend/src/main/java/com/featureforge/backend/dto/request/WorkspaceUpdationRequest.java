package com.featureforge.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class WorkspaceUpdationRequest {
    @NotBlank(message = "name can't be empty")
    private String workspaceName;
}
