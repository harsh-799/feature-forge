package com.featureforge.backend.dto.response;

import com.featureforge.backend.enums.FeatureStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class FeatureDetailsResponse {

    private Integer id;
    private String name;
    private String key;
    private String description;
    private FeatureStatus status;

    private String rejectionReason;

    private List<FeatureEnvironmentDetailsResponse> environments;

    private List<FeatureScheduleDetailsResponse> scheduledChanges;

    private LocalDateTime createdAt;
    private LocalDateTime lastUpdatedAt;

}
