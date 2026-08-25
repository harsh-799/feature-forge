package com.featureforge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeatureOverviewResponse {
    private Boolean success;
    private String message;
    private Integer active;
    private Integer development;
    private Integer staging;
    private Integer production;
}
