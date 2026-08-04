package com.featureforge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeatureProductionScheduleResponse {
    private Boolean success;
    private String message;
    private Integer featureId;
    private LocalDateTime scheduledAt;
}
