package com.featureforge.backend.service;

import com.featureforge.backend.dto.request.*;
import com.featureforge.backend.dto.response.*;
import com.featureforge.backend.entity.*;
import com.featureforge.backend.enums.*;
import com.featureforge.backend.exception.*;
import com.featureforge.backend.repository.*;
import com.featureforge.backend.workflow.FeatureStatusTransition;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class FeatureService {

    private final WorkspaceMembershipRepository workspaceMembershipRepository;
    private final EnvironmentRepository environmentRepository;
    private final FeatureEnvironmentConfigRepository featureEnvironmentConfigRepository;
    private final FeatureRepository featureRepository;
    private final FeatureScheduleRepository featureScheduleRepository;
    private final ActivityLogger activityLogger;

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
                .rolloutPercentage(environment.getName() == EnvironmentName.PRODUCTION ? 0 : null)
                .isEnabled(false)
                .build();

        featureEnvironmentConfigRepository.save(featureEnvironmentConfig);
    }

    public static String generateFeatureKey(String featureName) {
        return featureName
                .trim()
                .toUpperCase()
                .replaceAll("\\s+", "_");
    }

    @Transactional
    public FeatureCreationResponse createFeature(FeatureCreationRequest featureCreationRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
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

        String key = generateFeatureKey(name);

        if (description != null) {
            description = description.trim();

            if (description.isEmpty())
                description = null;
        }

        Feature feature = Feature.builder()
                .name(name)
                .key(key)
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

        activityLogger.logActivity(
                workspace.getId(),
                "CREATED_FEATURE",
                savedFeature.getName(),
                loggedInUser.getFullname() != null && !loggedInUser.getFullname().trim().isEmpty() ? loggedInUser.getFullname() : loggedInUser.getEmail()
        );

        return FeatureCreationResponse.builder()
                .featureId(savedFeature.getId())
                .name(savedFeature.getName())
                .description(savedFeature.getDescription())
                .status(savedFeature.getStatus())
                .createdAt(savedFeature.getCreatedAt())
                .featureKey(savedFeature.getKey())
                .build();
    }

    public FeaturesPageResponse getAllFeaturesOfWorkspace(int page, int size, FeatureStatus status, UUID workspaceId) {
        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        workspaceId,
                        loggedInUser
                ).orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        Workspace memberWorkspace = member.getWorkspace();

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Feature> featuresPage;

        if (status == null)
            featuresPage = featureRepository.findByWorkspace(memberWorkspace, pageable);
        else
            featuresPage = featureRepository.findByWorkspaceAndStatus(memberWorkspace, status, pageable);

        List<Feature> features = featuresPage.getContent();
        List<FeatureSummaryResponse> featuresList = new ArrayList<>();

        for (Feature feature: features) {
            FeatureSummaryResponse featureSummaryResponse = FeatureSummaryResponse
                    .builder()
                    .featureId(feature.getId())
                    .name(feature.getName())
                    .description(feature.getDescription())
                    .status(feature.getStatus())
                    .createdAt(feature.getCreatedAt())
                    .key(feature.getKey())
                    .build();

            featuresList.add(featureSummaryResponse);
        }

        return FeaturesPageResponse.builder()
                .success(true)
                .message("Data fetched successfully")
                .features(featuresList)
                .page(featuresPage.getNumber())
                .size(featuresPage.getSize())
                .totalElements(featuresPage.getTotalElements())
                .isLast(featuresPage.isLast())
                .build();
    }

    public FeaturesPageResponse getAllFeaturesOfWorkspaceByKeyword(int page, int size, FeatureStatus status, UUID workspaceId, String keyword) {
        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        workspaceId,
                        loggedInUser
                ).orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        Workspace memberWorkspace = member.getWorkspace();

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Feature> featuresPage;

        keyword = keyword.trim();

        if (status == null && keyword.isEmpty())
            featuresPage = featureRepository.findByWorkspace(memberWorkspace, pageable);
        else if (status != null && keyword.isEmpty())
            featuresPage = featureRepository.findByWorkspaceAndStatus(memberWorkspace, status, pageable);
        else if (status != null && !keyword.isEmpty())
            featuresPage = featureRepository.
                    findByWorkspaceAndStatusAndNameContainingIgnoreCase(memberWorkspace, status, keyword, pageable);
        else
            featuresPage = featureRepository.findByWorkspaceAndNameContainingIgnoreCase(memberWorkspace, keyword, pageable);


        List<Feature> features = featuresPage.getContent();
        List<FeatureSummaryResponse> featuresList = new ArrayList<>();

        for (Feature feature: features) {
            FeatureSummaryResponse featureSummaryResponse = FeatureSummaryResponse
                    .builder()
                    .featureId(feature.getId())
                    .name(feature.getName())
                    .description(feature.getDescription())
                    .status(feature.getStatus())
                    .createdAt(feature.getCreatedAt())
                    .key(feature.getKey())
                    .build();

            featuresList.add(featureSummaryResponse);
        }

        return FeaturesPageResponse.builder()
                .success(true)
                .message("Data fetched successfully")
                .features(featuresList)
                .page(featuresPage.getNumber())
                .size(featuresPage.getSize())
                .totalElements(featuresPage.getTotalElements())
                .isLast(featuresPage.isLast())
                .build();
    }

    public FeatureDetailsResponse getFeatureDetails(int featureId, UUID workspaceId) {
        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        workspaceId,
                        loggedInUser
                ).orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        Feature feature = featureRepository.findById(featureId).orElseThrow(
                () -> new FeatureNotFoundException("Feature not found")
        );

        if (!feature.getWorkspace().getId().equals(workspaceId)) {
            throw new AccessDeniedException("Access denied: Feature does not belong to this workspace.");
        }

        List<FeatureEnvironmentConfig> configs = featureEnvironmentConfigRepository.findByFeature(feature);
        List<FeatureDetailsResponse.EnvironmentConfigResponse> envResponses = new ArrayList<>();

        for (FeatureEnvironmentConfig config : configs) {
            envResponses.add(FeatureDetailsResponse.EnvironmentConfigResponse.builder()
                    .environmentName(config.getEnvironment().getName().name())
                    .isEnabled(config.isEnabled())
                    .rolloutPercentage(config.getRolloutPercentage())
                    .build());
        }

        return FeatureDetailsResponse.builder()
                .featureId(feature.getId())
                .name(feature.getName())
                .key(feature.getKey())
                .description(feature.getDescription())
                .status(feature.getStatus())
                .createdAt(feature.getCreatedAt())
                .rejectionReason(feature.getRejectionReason())
                .environments(envResponses)
                .build();
    }

    @Transactional
    public PromoteToStagingResponse promoteToStaging(int featureId, PromoteToStagingRequest promoteToStagingRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        promoteToStagingRequest.getWorkspaceID(),
                        loggedInUser
                ).orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        Workspace memberWorkspace = member.getWorkspace();

        if (member.getRole() != Role.ADMIN && member.getRole() != Role.DEVELOPER)
            throw new AccessDeniedException("Unauthorized Access: You do not have permission to perform this action");

        Feature feature = featureRepository.findById(featureId).orElseThrow(
                () -> new FeatureNotFoundException("feature not found")
        );

        if (!feature.getWorkspace().getId().equals(memberWorkspace.getId()))
            throw new WorkspaceMismatchException("Access denied. Feature is not associated with your workspace.");

        FeatureStatusTransition.validateTransition(feature.getStatus(), FeatureStatus.READY_FOR_QA);

        feature.setStatus(FeatureStatus.READY_FOR_QA);

        FeatureEnvironmentConfig featureEnvironmentConfig = featureEnvironmentConfigRepository.
                findByFeature_IdAndEnvironment_Name(
                        feature.getId(),
                        EnvironmentName.STAGING
                )
                .orElseThrow(
                        () -> new FeatureEnvironmentConfigNotFoundException("No environment configuration found for feature")
                );

        featureEnvironmentConfig.setEnabled(true);

        activityLogger.logActivity(
                memberWorkspace.getId(),
                "PROMOTED_TO_STAGING",
                feature.getName(),
                loggedInUser.getFullname() != null && !loggedInUser.getFullname().trim().isEmpty() ? loggedInUser.getFullname() : loggedInUser.getEmail()
        );

        PromoteToStagingResponse promoteToStagingResponse = new PromoteToStagingResponse();
        promoteToStagingResponse.setSuccess(true);
        promoteToStagingResponse.setMessage("feature status Updated to READY_FOR_QA");
        promoteToStagingResponse.setFeatureId(feature.getId());

        return promoteToStagingResponse;
    }

    @Transactional
    public FeatureQAVerificationResponse verifyFeatureByQA(int featureId, FeatureQAVerificationRequest featureQAVerificationRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        featureQAVerificationRequest.getWorkspaceId(),
                        loggedInUser
                ).orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        if (member.getRole() != Role.QA)
            throw new AccessDeniedException("Unauthorized Access: You do not have permission to perform this action");

        Feature feature = featureRepository
                .findById(featureId)
                .orElseThrow(() -> new FeatureNotFoundException("feature not found")
        );

        if (!feature.getWorkspace().getId().equals(member.getWorkspace().getId()))
            throw new WorkspaceMismatchException("Access denied. Feature is not associated with your workspace.");

        FeatureStatusTransition.validateTransition(feature.getStatus(), FeatureStatus.QA_VERIFIED);

        feature.setStatus(FeatureStatus.QA_VERIFIED);

        activityLogger.logActivity(
                member.getWorkspace().getId(),
                "QA_VERIFIED",
                feature.getName(),
                loggedInUser.getFullname() != null && !loggedInUser.getFullname().trim().isEmpty() ? loggedInUser.getFullname() : loggedInUser.getEmail()
        );

        FeatureQAVerificationResponse featureQAVerificationResponse = new FeatureQAVerificationResponse();
        featureQAVerificationResponse.setSuccess(true);
        featureQAVerificationResponse.setMessage("feature status changed to QA_VERIFIED");
        featureQAVerificationResponse.setFeatureId(feature.getId());

        return featureQAVerificationResponse;
    }

    @Transactional
    public FeatureQARejectionResponse rejectFeatureByQA(int featureId, FeatureQARejectionRequest featureQARejectionRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        featureQARejectionRequest.getWorkspaceId(),
                        loggedInUser
                ).orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        if (member.getRole() != Role.QA)
            throw new AccessDeniedException("Unauthorized Access: You do not have permission to perform this action");

        Feature feature = featureRepository
                .findById(featureId)
                .orElseThrow(() -> new FeatureNotFoundException("feature not found")
                );

        if (!feature.getWorkspace().getId().equals(member.getWorkspace().getId()))
            throw new WorkspaceMismatchException("Access denied. Feature is not associated with your workspace.");

        FeatureStatusTransition.validateTransition(feature.getStatus(), FeatureStatus.QA_REJECTED);

        feature.setStatus(FeatureStatus.QA_REJECTED);
        feature.setRejectionReason(featureQARejectionRequest.getRejectionReason().trim());

        activityLogger.logActivity(
                member.getWorkspace().getId(),
                "QA_REJECTED",
                feature.getName(),
                loggedInUser.getFullname() != null && !loggedInUser.getFullname().trim().isEmpty() ? loggedInUser.getFullname() : loggedInUser.getEmail()
        );

        FeatureQARejectionResponse featureQARejectionResponse = new FeatureQARejectionResponse();
        featureQARejectionResponse.setStatus(true);
        featureQARejectionResponse.setMessage("feature status changed to QA_VERIFIED");
        featureQARejectionResponse.setFeatureId(feature.getId());

        return featureQARejectionResponse;
    }

    @Transactional
    public FeatureProductionApprovalResponse approveFeatureToProduction(int featureId, FeatureProductionApprovalRequest featureProductionApprovalRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository.findByWorkspace_IdAndUser(
                featureProductionApprovalRequest.getWorkspaceId(),
                loggedInUser
        ).orElseThrow(
                () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
        );

        if (member.getRole() != Role.ADMIN)
            throw new AccessDeniedException("Unauthorized Access: You do not have permission to perform this action");


        Feature feature = featureRepository
                .findById(featureId)
                .orElseThrow(() -> new FeatureNotFoundException("feature not found")
                );

        if (!feature.getWorkspace().getId().equals(member.getWorkspace().getId()))
            throw new WorkspaceMismatchException("Access denied. Feature is not associated with your workspace.");

        FeatureStatusTransition.validateTransition(feature.getStatus(), FeatureStatus.IN_PRODUCTION);

        feature.setStatus(FeatureStatus.IN_PRODUCTION);

        activityLogger.logActivity(
                member.getWorkspace().getId(),
                "APPROVED_FOR_PRODUCTION",
                feature.getName(),
                loggedInUser.getFullname() != null && !loggedInUser.getFullname().trim().isEmpty() ? loggedInUser.getFullname() : loggedInUser.getEmail()
        );

        FeatureProductionApprovalResponse featureProductionApprovalResponse = new FeatureProductionApprovalResponse();
        featureProductionApprovalResponse.setSuccess(true);
        featureProductionApprovalResponse.setMessage("Feature is approved for the PRODUCTION");
        featureProductionApprovalResponse.setFeatureId(feature.getId());

        return featureProductionApprovalResponse;
    }

    @Transactional
    public FeatureProductionActivationResponse activateFeatureInProduction(int featureId, FeatureProductionActivationRequest featureProductionActivationRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        featureProductionActivationRequest.getWorkspaceId(),
                        loggedInUser
                ).orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        if (member.getRole() != Role.ADMIN)
            throw new AccessDeniedException("Unauthorized Access: You do not have permission to perform this action");

        Workspace memberWorkspace = member.getWorkspace();

        Feature feature = featureRepository
                .findById(featureId)
                .orElseThrow(() -> new FeatureNotFoundException("feature not found")
                );

        if (!feature.getWorkspace().getId().equals(memberWorkspace.getId()))
            throw new WorkspaceMismatchException("Access denied. Feature is not associated with your workspace.");

        if (feature.getStatus() != FeatureStatus.IN_PRODUCTION)
            throw new InvalidFeatureStatusException("Feature is not in PRODUCTION.");

        FeatureEnvironmentConfig featureEnvironmentConfig = featureEnvironmentConfigRepository
                .findByFeature_IdAndEnvironment_Name(
                        feature.getId(),
                        EnvironmentName.PRODUCTION
                ).orElseThrow(
                        () -> new FeatureEnvironmentConfigNotFoundException("No environment configuration found for this feature")
                );

        if (featureEnvironmentConfig.isEnabled())
            throw new FeatureAlreadyActiveException("Feature is already active in production.");

        featureEnvironmentConfig.setEnabled(true);
        featureEnvironmentConfig.setRolloutPercentage(featureProductionActivationRequest.getRolloutPercentage());

        activityLogger.logActivity(
                memberWorkspace.getId(),
                "ACTIVATED_IN_PRODUCTION",
                feature.getName() + " (" + featureProductionActivationRequest.getRolloutPercentage() + "% rollout)",
                loggedInUser.getFullname() != null && !loggedInUser.getFullname().trim().isEmpty() ? loggedInUser.getFullname() : loggedInUser.getEmail()
        );

        FeatureProductionActivationResponse featureProductionActivationResponse = new FeatureProductionActivationResponse();
        featureProductionActivationResponse.setSuccess(true);
        featureProductionActivationResponse.setMessage("Feature activated in production.");
        featureProductionActivationResponse.setFeatureId(feature.getId());

        return featureProductionActivationResponse;
    }


    @Transactional
    public FeatureProductionRolloutResponse updateRolloutInProduction(int featureId, FeatureProductionRolloutRequest featureProductionRolloutRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        featureProductionRolloutRequest.getWorkspaceId(),
                        loggedInUser
                ).orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        if (member.getRole() != Role.ADMIN)
            throw new AccessDeniedException("Unauthorized Access: You do not have permission to perform this action");

        Workspace memberWorkspace = member.getWorkspace();

        Feature feature = featureRepository
                .findById(featureId)
                .orElseThrow(() -> new FeatureNotFoundException("feature not found")
                );

        if (!feature.getWorkspace().getId().equals(memberWorkspace.getId()))
            throw new WorkspaceMismatchException("Access denied. Feature is not associated with your workspace.");

        if (feature.getStatus() != FeatureStatus.IN_PRODUCTION)
            throw new InvalidFeatureStatusException("Feature is not in PRODUCTION.");

        FeatureEnvironmentConfig featureEnvironmentConfig = featureEnvironmentConfigRepository
                .findByFeature_IdAndEnvironment_Name(
                        feature.getId(),
                        EnvironmentName.PRODUCTION
                ).orElseThrow(
                        () -> new FeatureEnvironmentConfigNotFoundException("No environment configuration found for this feature")
                );

        if (!featureEnvironmentConfig.isEnabled())
            throw new FeatureNotEnabledException("Feature is not active in production.");

        if (featureEnvironmentConfig.getRolloutPercentage().equals(featureProductionRolloutRequest.getRolloutPercentage()))
            throw new UnchangedRolloutPercentageException("Rollout percentage is already set to " +  featureEnvironmentConfig.getRolloutPercentage() + ". No update required.");

        featureEnvironmentConfig.setRolloutPercentage(featureProductionRolloutRequest.getRolloutPercentage());

        activityLogger.logActivity(
                memberWorkspace.getId(),
                "UPDATED_ROLLOUT",
                feature.getName() + " to " + featureProductionRolloutRequest.getRolloutPercentage() + "%",
                loggedInUser.getFullname() != null && !loggedInUser.getFullname().trim().isEmpty() ? loggedInUser.getFullname() : loggedInUser.getEmail()
        );

        FeatureProductionRolloutResponse featureProductionRolloutResponse = new FeatureProductionRolloutResponse();
        featureProductionRolloutResponse.setSuccess(true);
        featureProductionRolloutResponse.setMessage("feature rollout percentage is updated");
        featureProductionRolloutResponse.setFeatureId(feature.getId());
        featureProductionRolloutResponse.setRolloutPercentage(featureEnvironmentConfig.getRolloutPercentage());

        return featureProductionRolloutResponse;
    }

    @Transactional
    public FeatureProductionDeactivationResponse deactivateFeatureInProduction(int featureId, FeatureProductionDeactivationRequest featureProductionDeactivationRequest) {
        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        featureProductionDeactivationRequest.getWorkspaceId(),
                        loggedInUser
                ).orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        if (member.getRole() != Role.ADMIN)
            throw new AccessDeniedException("Unauthorized Access: You do not have permission to perform this action");

        Workspace memberWorkspace = member.getWorkspace();

        Feature feature = featureRepository
                .findById(featureId)
                .orElseThrow(() -> new FeatureNotFoundException("feature not found")
                );

        if (!feature.getWorkspace().getId().equals(memberWorkspace.getId()))
            throw new WorkspaceMismatchException("Access denied. Feature is not associated with your workspace.");

        if (feature.getStatus() != FeatureStatus.IN_PRODUCTION)
            throw new InvalidFeatureStatusException("Feature is not in PRODUCTION.");

        FeatureEnvironmentConfig featureEnvironmentConfig = featureEnvironmentConfigRepository
                .findByFeature_IdAndEnvironment_Name(
                        feature.getId(),
                        EnvironmentName.PRODUCTION
                ).orElseThrow(
                        () -> new FeatureEnvironmentConfigNotFoundException("No environment configuration found for this feature")
                );

        if (!featureEnvironmentConfig.isEnabled())
            throw new FeatureNotEnabledException("Feature is not active in production.");

        featureEnvironmentConfig.setEnabled(false);

        activityLogger.logActivity(
                memberWorkspace.getId(),
                "DEACTIVATED_IN_PRODUCTION",
                feature.getName(),
                loggedInUser.getFullname() != null && !loggedInUser.getFullname().trim().isEmpty() ? loggedInUser.getFullname() : loggedInUser.getEmail()
        );

        FeatureProductionDeactivationResponse featureProductionDeactivationResponse = new FeatureProductionDeactivationResponse();
        featureProductionDeactivationResponse.setSuccess(true);
        featureProductionDeactivationResponse.setMessage("Feature deactivated in production.");
        featureProductionDeactivationResponse.setFeatureId(feature.getId());

        return featureProductionDeactivationResponse;

    }

    @Transactional
    public FeatureProductionScheduleResponse scheduleFeatureInProduction(
            int featureId,
            FeatureProductionScheduleRequest featureProductionScheduleRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        featureProductionScheduleRequest.getWorkspaceId(),
                        loggedInUser
                )
                .orElseThrow(
                        () -> new AccessDeniedException(
                                "Access denied: You are not a member of this workspace."
                        )
                );

        if (member.getRole() != Role.ADMIN) {
            throw new AccessDeniedException(
                    "Unauthorized Access: You do not have permission to perform this action"
            );
        }

        Feature feature = featureRepository
                .findById(featureId)
                .orElseThrow(
                        () -> new FeatureNotFoundException("Feature not found")
                );

        if (!feature.getWorkspace().getId().equals(member.getWorkspace().getId())) {
            throw new WorkspaceMismatchException(
                    "Access denied. Feature is not associated with your workspace."
            );
        }

        // Scheduling production actions only makes sense after
        // the feature has been approved for production.
        if (feature.getStatus() != FeatureStatus.IN_PRODUCTION) {
            throw new InvalidFeatureStatusException(
                    "Feature is not in PRODUCTION."
            );
        }

        FeatureEnvironmentConfig prodConfig = featureEnvironmentConfigRepository
                .findByFeature_IdAndEnvironment_Name(
                        feature.getId(),
                        EnvironmentName.PRODUCTION
                )
                .orElseThrow(
                        () -> new FeatureEnvironmentConfigNotFoundException(
                                "No production environment configuration found for this feature"
                        )
                );

        ScheduledAction action = featureProductionScheduleRequest.getAction();

        switch (action) {

            case ACTIVATE -> {

                if (featureProductionScheduleRequest.getTargetRollout() == null) {
                    throw new RolloutPercentageRequiredException(
                            "Target rollout percentage is required for scheduled activation."
                    );
                }
            }

            case UPDATE_ROLLOUT -> {

                if (featureProductionScheduleRequest.getTargetRollout() == null) {
                    throw new RolloutPercentageRequiredException(
                            "Target rollout percentage is required for scheduled rollout update."
                    );
                }
            }

            case DEACTIVATE -> {
            }
        }

        FeatureSchedule featureSchedule = FeatureSchedule.builder()
                .feature(feature)
                .environment(prodConfig.getEnvironment())
                .action(action)
                .rolloutPercentage(featureProductionScheduleRequest.getTargetRollout())
                .scheduledAt(featureProductionScheduleRequest.getScheduledAt())
                .status(ScheduleStatus.PENDING)
                .build();

        FeatureSchedule savedFeatureSchedule =
                featureScheduleRepository.save(featureSchedule);

        activityLogger.logActivity(
                member.getWorkspace().getId(),
                "SCHEDULED_ACTION",
                feature.getName() + " (" + action.name() + ")",
                loggedInUser.getFullname() != null && !loggedInUser.getFullname().trim().isEmpty() ? loggedInUser.getFullname() : loggedInUser.getEmail()
        );

        FeatureProductionScheduleResponse response =
                new FeatureProductionScheduleResponse();

        response.setSuccess(true);
        response.setMessage("Feature action scheduled successfully.");
        response.setFeatureId(feature.getId());
        response.setScheduledAt(savedFeatureSchedule.getScheduledAt());

        return response;
    }

    @Transactional
    public FeatureUpdationResponse updateFeature(int featureId, FeatureUpdationRequest featureUpdationRequest) {
        User loggedInUser = fetchAuthenticatedUser();

        if ((featureUpdationRequest.getName() == null || featureUpdationRequest.getName().isBlank()) &&
                (featureUpdationRequest.getDescription() == null || featureUpdationRequest.getDescription().isBlank())) {

            throw new InvalidFeatureUpdateRequestException(
                    "At least one field (name or description) must be provided."
            );
        }

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        featureUpdationRequest.getWorkspaceId(),
                        loggedInUser
                ).orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        if (member.getRole() != Role.ADMIN && member.getRole() != Role.DEVELOPER)
            throw new AccessDeniedException(
                    "Unauthorized Access: You do not have permission to perform this action"
            );

        Feature feature = featureRepository
                .findById(featureId)
                .orElseThrow(
                        () -> new FeatureNotFoundException("Feature not found")
                );

        if (!feature.getWorkspace().getId().equals(member.getWorkspace().getId())) {
            throw new WorkspaceMismatchException(
                    "Access denied. Feature is not associated with your workspace."
            );
        }

        if (feature.getStatus() != FeatureStatus.IN_DEVELOPMENT)
            throw new FeatureModificationNotAllowedException("Feature can only be modified while in DEVELOPMENT status.");

        Workspace memberWorkspace = member.getWorkspace();

        if (featureUpdationRequest.getName() != null && !featureUpdationRequest.getName().isBlank()) {
            boolean featureAlreadyExist = featureRepository.existsByWorkspaceAndName(
                    memberWorkspace,
                    featureUpdationRequest.getName()
            );

            if (featureAlreadyExist)
                throw new FeatureAlreadyExistsException("Feature already exists with this Name in the workspace.");

            feature.setName(featureUpdationRequest.getName());
        }

        if (featureUpdationRequest.getDescription() != null && !featureUpdationRequest.getDescription().isBlank()) {
            feature.setDescription(featureUpdationRequest.getDescription());
        }

        activityLogger.logActivity(
                memberWorkspace.getId(),
                "UPDATED_FEATURE",
                feature.getName(),
                loggedInUser.getFullname() != null && !loggedInUser.getFullname().trim().isEmpty() ? loggedInUser.getFullname() : loggedInUser.getEmail()
        );

        FeatureUpdationResponse featureUpdationResponse = new FeatureUpdationResponse();
        featureUpdationResponse.setSuccess(true);
        featureUpdationResponse.setFeatureId(feature.getId());
        featureUpdationResponse.setMessage("feature updated successfully");

        return featureUpdationResponse;
    }

    @Transactional
    public FeatureEnvironmentToggleResponse toggleEnvironmentConfig(int featureId, String envName, FeatureEnvironmentToggleRequest request) {
        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        request.getWorkspaceId(),
                        loggedInUser
                ).orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        Workspace memberWorkspace = member.getWorkspace();

        Feature feature = featureRepository.findById(featureId).orElseThrow(
                () -> new FeatureNotFoundException("Feature not found")
        );

        if (!feature.getWorkspace().getId().equals(memberWorkspace.getId())) {
            throw new WorkspaceMismatchException("Access denied. Feature is not associated with your workspace.");
        }

        EnvironmentName environmentName;
        try {
            environmentName = EnvironmentName.valueOf(envName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidFeatureUpdateRequestException("Invalid environment name: " + envName);
        }

        // Validate permissions and feature status constraints
        if (environmentName == EnvironmentName.DEVELOPMENT) {
            if (member.getRole() != Role.ADMIN && member.getRole() != Role.DEVELOPER) {
                throw new AccessDeniedException("Unauthorized Access: Only Admins and Developers can modify Development environment.");
            }
            if (feature.getStatus() != FeatureStatus.IN_DEVELOPMENT) {
                throw new InvalidFeatureStatusException("Development environment configuration is locked when feature is not IN_DEVELOPMENT.");
            }
        } else if (environmentName == EnvironmentName.STAGING) {
            if (member.getRole() != Role.ADMIN && member.getRole() != Role.DEVELOPER && member.getRole() != Role.QA) {
                throw new AccessDeniedException("Unauthorized Access: Only Admins, Developers, and QAs can modify Staging environment.");
            }
            if (feature.getStatus() != FeatureStatus.READY_FOR_QA) {
                throw new InvalidFeatureStatusException("Staging environment configuration is locked when feature status is not READY_FOR_QA.");
            }
        } else if (environmentName == EnvironmentName.PRODUCTION) {
            throw new InvalidFeatureUpdateRequestException("Please use the specific production release controls to activate or deactivate the production environment.");
        }

        FeatureEnvironmentConfig config = featureEnvironmentConfigRepository
                .findByFeature_IdAndEnvironment_Name(feature.getId(), environmentName)
                .orElseThrow(
                        () -> new FeatureEnvironmentConfigNotFoundException("No configuration found for feature in environment " + environmentName)
                );

        config.setEnabled(request.getEnabled());

        activityLogger.logActivity(
                memberWorkspace.getId(),
                "TOGGLED_ENVIRONMENT",
                feature.getName() + " in " + environmentName + " (" + (request.getEnabled() ? "ENABLED" : "DISABLED") + ")",
                loggedInUser.getFullname() != null && !loggedInUser.getFullname().trim().isEmpty() ? loggedInUser.getFullname() : loggedInUser.getEmail()
        );

        return FeatureEnvironmentToggleResponse.builder()
                .success(true)
                .message("Feature flag toggled successfully in " + environmentName)
                .featureId(feature.getId())
                .environmentName(environmentName.name())
                .enabled(config.isEnabled())
                .build();
    }
}
