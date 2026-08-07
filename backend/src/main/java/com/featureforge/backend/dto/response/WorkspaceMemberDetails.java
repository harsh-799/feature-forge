package com.featureforge.backend.dto.response;

import com.featureforge.backend.enums.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkspaceMemberDetails {
    private Integer userId;
    private String name;
    private String email;
    private Role role;
}
