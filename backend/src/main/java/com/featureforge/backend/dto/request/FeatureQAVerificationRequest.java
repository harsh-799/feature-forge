package com.featureforge.backend.dto.request;

import lombok.Getter;
import java.util.UUID;

@Getter
public class FeatureQAVerificationRequest {
    private UUID workspaceId;
}
