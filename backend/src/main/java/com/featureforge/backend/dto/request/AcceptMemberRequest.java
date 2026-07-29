package com.featureforge.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import java.util.UUID;

@Getter
public class AcceptMemberRequest {
    @NotBlank(message = "token can't be empty")
    private UUID token;
}
