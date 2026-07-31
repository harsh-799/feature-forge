package com.featureforge.backend.service;

import com.featureforge.backend.dto.request.FeatureCreationRequest;
import com.featureforge.backend.dto.response.FeatureCreationResponse;
import com.featureforge.backend.entity.*;
import com.featureforge.backend.enums.EnvironmentName;
import com.featureforge.backend.enums.FeatureStatus;
import com.featureforge.backend.enums.Role;
import com.featureforge.backend.exception.AccessDeniedException;
import com.featureforge.backend.exception.EnvironmentNotFoundException;
import com.featureforge.backend.exception.FeatureAlreadyExistsException;
import com.featureforge.backend.repository.EnvironmentRepository;
import com.featureforge.backend.repository.FeatureEnviromentConfigRepository;
import com.featureforge.backend.repository.FeatureRepository;
import com.featureforge.backend.repository.WorkspaceMembershipRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class FeatureService {

    private final WorkspaceMembershipRepository workspaceMembershipRepository;
    private final EnvironmentRepository environmentRepository;
    private final FeatureEnviromentConfigRepository featureEnviromentConfigRepository;
    private final FeatureRepository featureRepository;

    private User fetchAuthenticatedUser() {
        CustomUserDetails customUserDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        return customUserDetails.getUser();
    }

    private void createDefaultFeatureEnvironmentConfig(Feature feature, Environment environment) {
        FeatureEnvironmentConfig featureEnvironmentConfig = FeatureEnvironmentConfig.builder()
                .feature(feature)
                .environment(environment)
                .rolloutPercentage(0)
                .isEnabled(false)
                .build();

        featureEnviromentConfigRepository.save(featureEnvironmentConfig);
    }


    @Transactional
    public FeatureCreationResponse createFeature(FeatureCreationRequest featureCreationRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspaceIdAndUser(
                featureCreationRequest.getWorkspaceId(),
                        loggedInUser
        ).orElseThrow(() -> new AccessDeniedException("Access denied: You are not a member of this workspace."));

        if (member.getRole() != Role.ADMIN && member.getRole() != Role.DEVELOPER)
            throw new AccessDeniedException("Unauthorized Access: You do not have permission to perform this action");

        Workspace workspace = member.getWorkspace();

        boolean featureAlreadyExist = featureRepository.existsByWorkspaceAndName(
                workspace, featureCreationRequest.getName().trim()
        );

        if (featureAlreadyExist)
            throw new FeatureAlreadyExistsException("Feature already exists in the workspace.");

        String name = featureCreationRequest.getName().trim();
        String description = featureCreationRequest.getDescription();

        if (description != null) {
            description = description.trim();

            if (description.isEmpty())
                description = null;
        }

        Feature feature = Feature.builder()
                .name(name)
                .description(description)
                .status(FeatureStatus.IN_DEVELOPMENT)
                .workspace(workspace)
                .build();

        Feature savedFeature = featureRepository.save(feature);

        List<Environment> environmentsList = environmentRepository.findByWorkspace(workspace);

        if (environmentsList.size() != 3)
            throw new IllegalStateException("Workspace environments are not properly initialized.");

        for (Environment environment : environmentsList) {
            createDefaultFeatureEnvironmentConfig(savedFeature, environment);
        }

        return FeatureCreationResponse.builder()
                .featureId(savedFeature.getId())
                .name(savedFeature.getName())
                .description(savedFeature.getDescription())
                .status(savedFeature.getStatus())
                .createdAt(savedFeature.getCreatedAt())
                .build();
    }
}
