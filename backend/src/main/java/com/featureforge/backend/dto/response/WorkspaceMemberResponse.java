package com.featureforge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.featureforge.backend.enums.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WorkspaceMemberResponse {
    private Boolean success;
    private String message;
    List<WorkspaceMemberDetails> membersData;
}
