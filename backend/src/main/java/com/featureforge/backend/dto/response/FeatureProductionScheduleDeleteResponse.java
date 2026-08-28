package com.featureforge.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeatureProductionScheduleDeleteResponse {
    private Boolean success;
    private String message;
    private Integer featureId;
}
