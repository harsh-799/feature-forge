package com.featureforge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.featureforge.backend.enums.FeatureStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeatureCreationResponse {

    private Integer featureId;

    private String name;

    private String description;

    private FeatureStatus status;

    private Integer version;

    private LocalDateTime createdAt;

    private String featureKey;

}
