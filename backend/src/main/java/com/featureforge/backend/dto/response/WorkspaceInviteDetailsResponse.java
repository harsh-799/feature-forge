package com.featureforge.backend.dto.response;

import com.featureforge.backend.enums.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class WorkspaceInviteDetailsResponse {
    private String email;
    private Role role;
    private LocalDateTime invitedAt;
}
