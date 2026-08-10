package com.featureforge.backend.dto.response;

import com.featureforge.backend.enums.ActivityType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ActivityLogResponse {
    private Long id;
    private ActivityType activityType;
    private String description;
    private Integer performedById;
    private String performedByName;
    private LocalDateTime createdAt;
}
