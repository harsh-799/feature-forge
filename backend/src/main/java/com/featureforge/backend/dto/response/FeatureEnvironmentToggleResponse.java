package com.featureforge.backend.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class FeatureEnvironmentToggleResponse {
    private boolean success;
    private String message;
    private int featureId;
    private String environmentName;
    private boolean enabled;
}
