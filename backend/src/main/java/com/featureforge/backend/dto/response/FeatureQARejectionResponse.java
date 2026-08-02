package com.featureforge.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeatureQARejectionResponse {
    private Boolean status;
    private String message;
    private Integer featureId;
}
