package com.featureforge.backend.dto.request;

import com.featureforge.backend.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class InviteMemberRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Must be email format")
    private String email;

    @NotNull(message = "workspaceId is required")
    private UUID workspaceId;

    @NotNull(message = "role is required")
    private Role role;
}
