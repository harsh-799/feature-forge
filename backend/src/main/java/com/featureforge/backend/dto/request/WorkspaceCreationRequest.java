package com.featureforge.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkspaceCreationRequest {
    @NotBlank(message = "Workspace name can't be empty")
    @Size(max = 100, message = "Workspace name size can't exceed 100 character")
    private String workspaceName;
}
