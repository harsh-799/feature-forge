package com.featureforge.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import java.util.UUID;

@Getter
public class AcceptMemberRequest {
    @NotNull(message = "token can't be empty")
    private UUID token;
}
