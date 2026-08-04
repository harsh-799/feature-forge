package com.featureforge.backend.dto.response;

import com.featureforge.backend.enums.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
@Builder
public class UserWorkspaceResponse {
    private UUID workspaceId;
    private String workspaceName;
    private Role role;
}
