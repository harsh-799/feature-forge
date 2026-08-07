package com.featureforge.backend.dto.request;

import com.featureforge.backend.enums.Role;
import lombok.Getter;

@Getter
public class WorkspaceMemberRequest {
    private Role role;
}
