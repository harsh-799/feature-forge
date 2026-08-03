package com.featureforge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeatureProductionRolloutResponse {
    private Boolean success;
    private String message;
    private Integer featureId;
    private Integer rolloutPercentage;
}
