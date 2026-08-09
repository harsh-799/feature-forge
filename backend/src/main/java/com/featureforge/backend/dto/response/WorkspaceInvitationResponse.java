package com.featureforge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WorkspaceInvitationResponse {
    private Boolean success;
    private String message;
    private List<WorkspaceInviteDetailsResponse> data;
}
