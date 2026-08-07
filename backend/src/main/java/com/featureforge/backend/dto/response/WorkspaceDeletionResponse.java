package com.featureforge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WorkspaceDeletionResponse {
    private Boolean success;
    private String message;
    private String workspaceName;
    private UUID workspaceId;
}
