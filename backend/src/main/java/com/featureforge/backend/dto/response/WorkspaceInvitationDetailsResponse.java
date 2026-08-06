package com.featureforge.backend.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class WorkspaceInvitationDetailsResponse {
    private java.util.UUID workspaceId;
    private String workspaceName;
    private String inviterName;
    private String invitedEmail;
    private String role;
    private String status;
    private boolean valid;
    private String message;
}
