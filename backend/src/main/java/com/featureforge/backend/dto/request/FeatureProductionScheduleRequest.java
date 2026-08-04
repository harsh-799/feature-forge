package com.featureforge.backend.dto.request;

import com.featureforge.backend.enums.ScheduledAction;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
public class FeatureProductionScheduleRequest {

    @NotNull(message = "workspace Id can't be null")
    private UUID workspaceId;

    @NotNull(message = "action can't be null")
    private ScheduledAction action;

    @Min(value = 1)
    @Max(value = 100)
    private Integer targetRollout;

    @NotNull(message = "schedule time can't be null")
    private LocalDateTime scheduledAt;
}
