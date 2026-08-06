package com.featureforge.backend.service;

import com.featureforge.backend.dto.request.FeatureEvaluationRequest;
import com.featureforge.backend.dto.response.FeatureEvaluationResponse;
import com.featureforge.backend.entity.Environment;
import com.featureforge.backend.entity.Feature;
import com.featureforge.backend.entity.FeatureEnvironmentConfig;
import com.featureforge.backend.entity.Workspace;
import com.featureforge.backend.enums.EnvironmentName;
import com.featureforge.backend.exception.FeatureEnvironmentConfigNotFoundException;
import com.featureforge.backend.exception.FeatureNotFoundException;
import com.featureforge.backend.exception.InvalidApiKeyException;
import com.featureforge.backend.repository.EnvironmentRepository;
import com.featureforge.backend.repository.FeatureEnvironmentConfigRepository;
import com.featureforge.backend.repository.FeatureRepository;
import com.featureforge.backend.util.ApiKeyManager;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class FeatureEvaluationService {

    private final EnvironmentRepository environmentRepository;
    private final FeatureEnvironmentConfigRepository featureEnvironmentConfigRepository;
    private final FeatureRepository featureRepository;
    private final ApiKeyManager apiKeyManager;


    private boolean isUserIncludedInRollout(
            String userIdentifier,
            String featureKey,
            int rolloutPercentage
    ) {

        String userFeatureKey  = userIdentifier + featureKey;
        int evaluationHash = userFeatureKey.hashCode();
        int bucket = Math.floorMod(evaluationHash, 100);

        return bucket < rolloutPercentage;
    }

    public FeatureEvaluationResponse evaluateFeature(FeatureEvaluationRequest featureEvaluationRequest, String apiKey) {
        String hashedApiKey = apiKeyManager.hashApiKey(apiKey);

        Environment clientEnvironment = environmentRepository
                .findByApiKeyHash(hashedApiKey)
                .orElseThrow(
                        () -> new InvalidApiKeyException("Invalid API key provided")
                );

        Workspace clientWorkspace = clientEnvironment.getWorkspace();

        Feature feature = featureRepository.
                findByWorkspaceAndKey(
                        clientWorkspace,
                        featureEvaluationRequest.getFeatureKey()
                ).orElseThrow(
                        () -> new FeatureNotFoundException("feature not found")
                );

        FeatureEnvironmentConfig featureEnvironmentConfig = featureEnvironmentConfigRepository
                .findByFeature_IdAndEnvironment_Name(
                        feature.getId(),
                        clientEnvironment.getName()
                ).orElseThrow(
                        () -> new FeatureEnvironmentConfigNotFoundException("")
                );

        if (!featureEnvironmentConfig.isEnabled())
            return new FeatureEvaluationResponse(false);

        if (clientEnvironment.getName() == EnvironmentName.DEVELOPMENT ||
        clientEnvironment.getName() == EnvironmentName.STAGING)
            return new FeatureEvaluationResponse(true);

        if (featureEnvironmentConfig.getRolloutPercentage().equals(100))
            return new FeatureEvaluationResponse(true);

        boolean isIncludedInRollout = isUserIncludedInRollout(
                featureEvaluationRequest.getUser(),
                feature.getKey(),
                featureEnvironmentConfig.getRolloutPercentage()
        );

        return new FeatureEvaluationResponse(isIncludedInRollout);
    }
}
