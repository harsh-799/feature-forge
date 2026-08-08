package com.featureforge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeatureDeletionResponse {
    private Boolean success;
    private String message;
    private Integer featureId;
    private String featureKey;
}
