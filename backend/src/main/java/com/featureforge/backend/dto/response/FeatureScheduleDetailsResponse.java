package com.featureforge.backend.dto.response;

import com.featureforge.backend.enums.ScheduleStatus;
import com.featureforge.backend.enums.ScheduledAction;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class FeatureScheduleDetailsResponse {
    private Integer id;
    private ScheduledAction action;
    private Integer rolloutPercentage;
    private LocalDateTime scheduledAt;
    private ScheduleStatus status;
}
