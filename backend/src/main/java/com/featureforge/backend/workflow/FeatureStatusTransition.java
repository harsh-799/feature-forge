package com.featureforge.backend.workflow;

import com.featureforge.backend.enums.FeatureStatus;
import com.featureforge.backend.exception.InvalidFlowTransitionException;
import java.util.Collections;
import java.util.Map;
import java.util.Set;

public class FeatureStatusTransition {

    private static final Map<FeatureStatus, Set<FeatureStatus>> ALLOWED_TRANSITION =
        Map.of(
                FeatureStatus.IN_DEVELOPMENT, Set.of(FeatureStatus.READY_FOR_QA),
                FeatureStatus.READY_FOR_QA, Set.of(FeatureStatus.QA_VERIFIED, FeatureStatus.QA_REJECTED),
                FeatureStatus.QA_VERIFIED, Set.of(FeatureStatus.IN_PRODUCTION),
                FeatureStatus.QA_REJECTED, Set.of(FeatureStatus.IN_DEVELOPMENT)
        );

    public static void validateTransition(FeatureStatus currentStatus, FeatureStatus newStatus) {

        Set<FeatureStatus> allowedStatuses =
                ALLOWED_TRANSITION.getOrDefault(currentStatus, Collections.emptySet());

        if (!allowedStatuses.contains(newStatus))
            throw new InvalidFlowTransitionException("Next status is invalid");
    }
}
