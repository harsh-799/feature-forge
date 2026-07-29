package com.featureforge.backend.dto.request;

import com.featureforge.backend.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class InviteMemberRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Must be email format")
    private String email;

    private UUID workspaceId;

    private Role role;
}
