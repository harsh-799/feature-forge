package com.featureforge.backend.dto.response;

import com.featureforge.backend.enums.FeatureStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class FeatureSummaryResponse {

    private Integer featureId;

    private String name;

    private String description;

    private FeatureStatus status;

    private LocalDateTime createdAt;

    private String key;

}
