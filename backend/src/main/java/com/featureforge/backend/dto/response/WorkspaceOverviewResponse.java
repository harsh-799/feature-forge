package com.featureforge.backend.dto.response;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkspaceOverviewResponse {
    private long totalFeatureFlags;
    private long inDevelopmentFlags;
    private long waitingForQaFlags;
    private long inProductionFlags;

    private long pipelineDevelopmentCount;
    private long pipelineStagingQaCount;
    private long pipelineProductionCount;

    private List<EnvironmentStatusDTO> environments;
    private Map<String, Long> teamRoleCounts;
    private List<ActivityLogResponse> recentActivities;

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EnvironmentStatusDTO {
        private String name;
        private String status;
    }
}
