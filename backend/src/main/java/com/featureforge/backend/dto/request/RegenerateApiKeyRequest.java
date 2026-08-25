package com.featureforge.backend.dto.request;

import com.featureforge.backend.enums.EnvironmentName;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class RegenerateApiKeyRequest {
    @NotNull(message = "Environment Name can't be empty")
    private EnvironmentName environmentName;
}
