package com.featureforge.backend.dto.response;

import com.featureforge.backend.entity.Environment;
import com.featureforge.backend.enums.EnvironmentName;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FeatureEnvironmentDetailsResponse {
    private EnvironmentName name;
    private Integer rolloutPercentage;
    private Boolean enabled;
}
