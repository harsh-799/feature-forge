package com.featureforge.backend.dto.response;

import com.featureforge.backend.enums.FeatureStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class FeatureDetailsResponse {

    private Integer featureId;

    private String name;

    private String key;

    private String description;

    private FeatureStatus status;

    private LocalDateTime createdAt;

    private String rejectionReason;

    private List<EnvironmentConfigResponse> environments;

    @Getter
    @Setter
    @Builder
    public static class EnvironmentConfigResponse {
        private String environmentName;
        private boolean isEnabled;
        private Integer rolloutPercentage;
    }
}
