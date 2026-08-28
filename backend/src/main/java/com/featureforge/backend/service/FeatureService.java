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
    private final ActivityLogService activityLogService;

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
                .rolloutPercentage(environment.getName() == EnvironmentName.PRODUCTION ? 0 : 100)
                .isEnabled(environment.getName() == EnvironmentName.STAGING)
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
                .createdBy(loggedInUser)
                .build();

        Feature savedFeature = featureRepository.save(feature);

         Environment environment  = environmentRepository
                .findByWorkspaceAndName(workspace, EnvironmentName.DEVELOPMENT)
                 .orElseThrow(
                         () -> new IllegalStateException("Workspace environments are not properly initialized.")
                 );

        createDefaultFeatureEnvironmentConfig(savedFeature, environment);

        activityLogService.log(workspace, loggedInUser, ActivityType.FEATURE_CREATED, "Created feature '" + savedFeature.getName() + "'.");

        return FeatureCreationResponse.builder()
                .featureId(savedFeature.getId())
                .name(savedFeature.getName())
                .description(savedFeature.getDescription())
                .status(savedFeature.getStatus())
                .createdAt(savedFeature.getCreatedAt())
                .build();
    }

    public FeaturesPageResponse getAllFeaturesOfWorkspace(int page, int size, FeatureStatus status, UUID workspaceId, String keyword, EnvironmentName environment) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        workspaceId,
                        loggedInUser
                ).orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        Workspace memberWorkspace = member.getWorkspace();

        Pageable pageable = PageRequest.of(page, size);

        keyword = keyword.trim();

        Page<FeatureEnvironmentConfig> featureEnvironmentConfigPage = featureEnvironmentConfigRepository
                .findAllEnvironmentRelatedFeatures(
                        environment,
                        memberWorkspace.getId(),
                        status,
                        keyword,
                        pageable
                );

        List<FeatureEnvironmentConfig> featureEnvironmentConfigList = featureEnvironmentConfigPage.getContent();

        List<FeatureSummaryResponse> featureSummaryResponsesList = new ArrayList<>();

        for (FeatureEnvironmentConfig featureEnvironmentConfig : featureEnvironmentConfigList) {
            FeatureSummaryResponse featureSummaryResponse = FeatureSummaryResponse.builder()
                    .featureId(featureEnvironmentConfig.getFeature().getId())
                    .name(featureEnvironmentConfig.getFeature().getName())
                    .description(featureEnvironmentConfig.getFeature().getDescription())
                    .status(featureEnvironmentConfig.getFeature().getStatus())
                    .createdAt(featureEnvironmentConfig.getFeature().getCreatedAt())
                    .isEnabled(featureEnvironmentConfig.isEnabled())
                    .build();

            featureSummaryResponsesList.add(featureSummaryResponse);
        }

        return FeaturesPageResponse.builder()
                .success(true)
                .message("features fetched successfully")
                .page(featureEnvironmentConfigPage.getNumber())
                .size(featureEnvironmentConfigPage.getSize())
                .totalElements(featureEnvironmentConfigPage.getTotalElements())
                .isLast(featureEnvironmentConfigPage.isLast())
                .features(featureSummaryResponsesList)
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

        Environment environment = environmentRepository
                .findByWorkspaceAndName(memberWorkspace, EnvironmentName.STAGING)
                        .orElseThrow(
                                () -> new IllegalStateException("Workspace environments are not properly initialized.")
                        );

        createDefaultFeatureEnvironmentConfig(feature, environment);

        activityLogService.log(memberWorkspace, loggedInUser, ActivityType.FEATURE_PROMOTED_TO_STAGING, "Promoted feature '" + feature.getName() + "' to staging.");

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

        activityLogService.log(member.getWorkspace(), loggedInUser, ActivityType.FEATURE_QA_ACCEPTED, "Accepted feature '" + feature.getName() + "' during QA.");

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

        activityLogService.log(member.getWorkspace(), loggedInUser, ActivityType.FEATURE_QA_REJECTED, "Rejected feature '" + feature.getName() + "' during QA.");

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

        Workspace workspace = member.getWorkspace();

        Feature feature = featureRepository
                .findById(featureId)
                .orElseThrow(() -> new FeatureNotFoundException("feature not found")
                );

        if (!feature.getWorkspace().getId().equals(member.getWorkspace().getId()))
            throw new WorkspaceMismatchException("Access denied. Feature is not associated with your workspace.");

        FeatureStatusTransition.validateTransition(feature.getStatus(), FeatureStatus.IN_PRODUCTION);

        feature.setStatus(FeatureStatus.IN_PRODUCTION);

        Environment environment = environmentRepository
                .findByWorkspaceAndName(workspace,EnvironmentName.PRODUCTION)
                        .orElseThrow(
                                () -> new IllegalStateException("Workspace environments are not properly initialized.")
                        );

        createDefaultFeatureEnvironmentConfig(feature, environment);

        activityLogService.log(member.getWorkspace(), loggedInUser, ActivityType.FEATURE_APPROVED_FOR_PRODUCTION, "Approved feature '" + feature.getName() + "' for production.");

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

        activityLogService.log(memberWorkspace, loggedInUser, ActivityType.FEATURE_ACTIVATED_IN_PRODUCTION, "Activated feature '" + feature.getName() + "' in production.");

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

        Integer oldRollout = featureEnvironmentConfig.getRolloutPercentage();
        Integer newRollout = featureProductionRolloutRequest.getRolloutPercentage();
        featureEnvironmentConfig.setRolloutPercentage(newRollout);

        activityLogService.log(memberWorkspace, loggedInUser, ActivityType.FEATURE_ROLLOUT_UPDATED, "Changed '" + feature.getName() + "' production rollout from " + oldRollout + "% to " + newRollout + "%.");

        FeatureProductionRolloutResponse featureProductionRolloutResponse = new FeatureProductionRolloutResponse();
        featureProductionRolloutResponse.setSuccess(true);
        featureProductionRolloutResponse.setMessage("feature rollout percentage is updated");
        featureProductionRolloutResponse.setFeatureId(feature.getId());
        featureProductionRolloutResponse.setRolloutPercentage(featureEnvironmentConfig.getRolloutPercentage());

        return featureProductionRolloutResponse;
    }

    @Transactional
    public FeatureDeactivationResponse deactivateFeatureInProduction(int featureId, FeatureDeactivationRequest featureDeactivationRequest) {
        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        featureDeactivationRequest.getWorkspaceId(),
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

        activityLogService.log(memberWorkspace, loggedInUser, ActivityType.FEATURE_DEACTIVATED_IN_PRODUCTION, "Deactivated feature '" + feature.getName() + "' in production.");

        FeatureDeactivationResponse featureDeactivationResponse = new FeatureDeactivationResponse();
        featureDeactivationResponse.setSuccess(true);
        featureDeactivationResponse.setMessage("Feature deactivated in production.");
        featureDeactivationResponse.setFeatureId(feature.getId());

        return featureDeactivationResponse;

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

        activityLogService.log(member.getWorkspace(), loggedInUser, ActivityType.FEATURE_SCHEDULED, "Scheduled " + action.name().toLowerCase() + " action for feature '" + feature.getName() + "'.");

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

        FeatureUpdationResponse featureUpdationResponse = new FeatureUpdationResponse();
        featureUpdationResponse.setSuccess(true);
        featureUpdationResponse.setFeatureId(feature.getId());
        featureUpdationResponse.setMessage("feature updated successfully");

        activityLogService.log(memberWorkspace, loggedInUser, ActivityType.FEATURE_UPDATED, "Updated feature '" + feature.getName() + "'.");

        return featureUpdationResponse;
    }

    @Transactional
    public FeatureDeletionResponse deleteFeature(int featureId,  FeatureDeletionRequest featureDeletionRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        featureDeletionRequest.getWorkspaceId(),
                        loggedInUser
                )
                .orElseThrow(
                        () -> new AccessDeniedException(
                                "Access denied: You are not a member of this workspace."
                        )
                );

        if (member.getRole() != Role.ADMIN && member.getRole() != Role.DEVELOPER) {
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

        FeatureEnvironmentConfig featureEnvironmentConfig = featureEnvironmentConfigRepository
                .findByFeature_IdAndEnvironment_Name(
                        feature.getId(),
                        EnvironmentName.PRODUCTION
                ).orElseThrow(
                () -> new InvalidEnvironmentException("Production environment configuration not found for this feature.")
        );


        if (feature.getStatus() == FeatureStatus.IN_PRODUCTION && featureEnvironmentConfig.isEnabled()) {
            throw new FeatureInProductionException(
                    "Disable the feature before deleting it."
            );
        }

        featureEnvironmentConfigRepository.deleteByFeature(feature);
        featureScheduleRepository.deleteByFeature(feature);

        featureRepository.deleteById(featureId);

        activityLogService.log(member.getWorkspace(), loggedInUser, ActivityType.FEATURE_DELETED, "Deleted feature '" + feature.getName() + "'.");

        return FeatureDeletionResponse.builder()
                .success(true)
                .message("Feature deleted successfully")
                .featureId(feature.getId())
                .featureKey(feature.getKey())
                .build();
    }

    public FeatureDetailsApiResponse fetchFeatureDetails(UUID workspaceId, int featureId) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership membership = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(workspaceId,loggedInUser)
                .orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        Feature feature = featureRepository.findById(featureId)
                .orElseThrow(
                        () -> new FeatureNotFoundException("Feature not found")
                );

        if (!feature.getWorkspace().getId().equals(membership.getWorkspace().getId())) {
            throw new WorkspaceMismatchException(
                    "Access denied. Feature is not associated with your workspace."
            );
        }

        List<FeatureEnvironmentConfig> featureEnvironmentConfigList = featureEnvironmentConfigRepository
                .findAllByFeatureOrderByEnvironment_IdAsc(feature);

        List<FeatureEnvironmentDetailsResponse> featureEnvironmentList = new ArrayList<>();

        for (FeatureEnvironmentConfig featureEnv: featureEnvironmentConfigList) {
            FeatureEnvironmentDetailsResponse environmentDetails = FeatureEnvironmentDetailsResponse.builder()
                    .name(featureEnv.getEnvironment().getName())
                    .rolloutPercentage(featureEnv.getRolloutPercentage())
                    .enabled(featureEnv.isEnabled())
                    .build();

            featureEnvironmentList.add(environmentDetails);
        }

        List<FeatureSchedule> featureScheduleList = featureScheduleRepository
                .findByFeatureAndStatus(feature, ScheduleStatus.PENDING);

        List<FeatureScheduleDetailsResponse> featureScheduleDetailsResponseList = new ArrayList<>();

        for (FeatureSchedule featureSchedule : featureScheduleList) {
            FeatureScheduleDetailsResponse featureScheduleDetailsResponse = FeatureScheduleDetailsResponse
                    .builder()
                    .id(featureSchedule.getId())
                    .action(featureSchedule.getAction())
                    .rolloutPercentage(featureSchedule.getRolloutPercentage())
                    .scheduledAt(featureSchedule.getScheduledAt())
                    .status(featureSchedule.getStatus())
                    .build();

            featureScheduleDetailsResponseList.add(featureScheduleDetailsResponse);
        }

        FeatureDetailsResponse featureDetailsResponse = FeatureDetailsResponse
                .builder()
                .id(feature.getId())
                .name(feature.getName())
                .key(feature.getKey())
                .description(feature.getDescription())
                .status(feature.getStatus())
                .rejectionReason(feature.getRejectionReason())
                .environments(featureEnvironmentList)
                .scheduledChanges(featureScheduleDetailsResponseList)
                .createdAt(feature.getCreatedAt())
                .lastUpdatedAt(feature.getUpdatedAt())
                .build();

        FeatureDetailsApiResponse response = new FeatureDetailsApiResponse();
        response.setSuccess(true);
        response.setMessage("Feature details fetched successfully");
        response.setData(featureDetailsResponse);

        return response;
    }

    @Transactional
    public FeatureDeactivationResponse deactivateFeatureInDevelopment(int featureId, FeatureDeactivationRequest featureDeactivationRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership membership = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(featureDeactivationRequest.getWorkspaceId(),loggedInUser)
                .orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        if (membership.getRole() != Role.ADMIN && membership.getRole() != Role.DEVELOPER)
            throw new AccessDeniedException(
                    "Unauthorized Access: You do not have permission to perform this action"
            );

        Feature feature = featureRepository.findById(featureId)
                .orElseThrow(
                        () -> new FeatureNotFoundException("Feature not found")
                );

        if (!feature.getWorkspace().getId().equals(membership.getWorkspace().getId())) {
            throw new WorkspaceMismatchException(
                    "Access denied. Feature is not associated with your workspace."
            );
        }

        FeatureEnvironmentConfig featureEnvironmentConfig = featureEnvironmentConfigRepository
                .findByFeature_IdAndEnvironment_Name(
                        feature.getId(),
                        EnvironmentName.DEVELOPMENT
                ).orElseThrow(
                        () -> new FeatureEnvironmentConfigNotFoundException("No environment configuration found for this feature")
                );

        if (!featureEnvironmentConfig.isEnabled())
            throw new FeatureAlreadyDisabledException("Feature is already disabled in development.");

        featureEnvironmentConfig.setEnabled(false);

        activityLogService.log(membership.getWorkspace(), loggedInUser, ActivityType.FEATURE_DEACTIVATED_IN_DEVELOPMENT, "Deactivated feature '" + feature.getName() + "' in development.");

        FeatureDeactivationResponse featureDeactivationResponse = new FeatureDeactivationResponse();
        featureDeactivationResponse.setSuccess(true);
        featureDeactivationResponse.setMessage("Feature deactivated in development.");
        featureDeactivationResponse.setFeatureId(feature.getId());


        return featureDeactivationResponse;
    }

    @Transactional
    public FeatureActivationResponse activateFeatureInDevelopment(int featureId, FeatureActivationRequest featureActivationRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership membership = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(featureActivationRequest.getWorkspaceId(),loggedInUser)
                .orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        if (membership.getRole() != Role.ADMIN && membership.getRole() != Role.DEVELOPER)
            throw new AccessDeniedException(
                    "Unauthorized Access: You do not have permission to perform this action"
            );

        Feature feature = featureRepository.findById(featureId)
                .orElseThrow(
                        () -> new FeatureNotFoundException("Feature not found")
                );

        if (!feature.getWorkspace().getId().equals(membership.getWorkspace().getId())) {
            throw new WorkspaceMismatchException(
                    "Access denied. Feature is not associated with your workspace."
            );
        }

        FeatureEnvironmentConfig featureEnvironmentConfig = featureEnvironmentConfigRepository
                .findByFeature_IdAndEnvironment_Name(
                        feature.getId(),
                        EnvironmentName.DEVELOPMENT
                ).orElseThrow(
                        () -> new FeatureEnvironmentConfigNotFoundException("No environment configuration found for this feature")
                );

        if (featureEnvironmentConfig.isEnabled())
            throw new FeatureAlreadyActiveException("Feature is already enabled in development.");

        featureEnvironmentConfig.setEnabled(true);

        activityLogService.log(membership.getWorkspace(), loggedInUser, ActivityType.FEATURE_ACTIVATED_IN_DEVELOPMENT, "Activated feature '" + feature.getName() + "' in development.");

        FeatureActivationResponse featureActivationResponse = new FeatureActivationResponse();
        featureActivationResponse.setSuccess(true);
        featureActivationResponse.setMessage("Feature activated in development.");
        featureActivationResponse.setFeatureId(feature.getId());


        return featureActivationResponse;

    }

    @Transactional
    public FeatureDeactivationResponse deactivateFeatureInStaging(int featureId, FeatureDeactivationRequest featureDeactivationRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership membership = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(featureDeactivationRequest.getWorkspaceId(),loggedInUser)
                .orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        if (membership.getRole() != Role.ADMIN && membership.getRole() != Role.QA)
            throw new AccessDeniedException(
                    "Unauthorized Access: You do not have permission to perform this action"
            );

        Feature feature = featureRepository.findById(featureId)
                .orElseThrow(
                        () -> new FeatureNotFoundException("Feature not found")
                );

        if (!feature.getWorkspace().getId().equals(membership.getWorkspace().getId())) {
            throw new WorkspaceMismatchException(
                    "Access denied. Feature is not associated with your workspace."
            );
        }

        FeatureEnvironmentConfig featureEnvironmentConfig = featureEnvironmentConfigRepository
                .findByFeature_IdAndEnvironment_Name(
                        feature.getId(),
                        EnvironmentName.STAGING
                ).orElseThrow(
                        () -> new FeatureEnvironmentConfigNotFoundException("No environment configuration found for this feature")
                );

        if (!featureEnvironmentConfig.isEnabled())
            throw new FeatureAlreadyDisabledException("Feature is already disabled in staging.");

        featureEnvironmentConfig.setEnabled(false);

        activityLogService.log(membership.getWorkspace(), loggedInUser, ActivityType.FEATURE_DEACTIVATED_IN_STAGING, "Deactivated feature '" + feature.getName() + "' in staging.");

        FeatureDeactivationResponse featureDeactivationResponse = new FeatureDeactivationResponse();
        featureDeactivationResponse.setSuccess(true);
        featureDeactivationResponse.setMessage("Feature deactivated in staging.");
        featureDeactivationResponse.setFeatureId(feature.getId());


        return featureDeactivationResponse;

    }

    @Transactional
    public FeatureActivationResponse activateFeatureInStaging(int featureId, FeatureActivationRequest featureActivationRequest) {
        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership membership = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(featureActivationRequest.getWorkspaceId(),loggedInUser)
                .orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        if (membership.getRole() != Role.ADMIN && membership.getRole() != Role.QA)
            throw new AccessDeniedException(
                    "Unauthorized Access: You do not have permission to perform this action"
            );

        Feature feature = featureRepository.findById(featureId)
                .orElseThrow(
                        () -> new FeatureNotFoundException("Feature not found")
                );

        if (!feature.getWorkspace().getId().equals(membership.getWorkspace().getId())) {
            throw new WorkspaceMismatchException(
                    "Access denied. Feature is not associated with your workspace."
            );
        }

        FeatureEnvironmentConfig featureEnvironmentConfig = featureEnvironmentConfigRepository
                .findByFeature_IdAndEnvironment_Name(
                        feature.getId(),
                        EnvironmentName.STAGING
                ).orElseThrow(
                        () -> new FeatureEnvironmentConfigNotFoundException("No environment configuration found for this feature")
                );

        if (featureEnvironmentConfig.isEnabled())
            throw new FeatureAlreadyActiveException("Feature is already enabled in staging.");

        featureEnvironmentConfig.setEnabled(true);

        activityLogService.log(membership.getWorkspace(), loggedInUser, ActivityType.FEATURE_ACTIVATED_IN_STAGING, "Activated feature '" + feature.getName() + "' in staging.");

        FeatureActivationResponse featureActivationResponse = new FeatureActivationResponse();
        featureActivationResponse.setSuccess(true);
        featureActivationResponse.setMessage("Feature activated in staging.");
        featureActivationResponse.setFeatureId(feature.getId());


        return featureActivationResponse;
    }

    public FeaturesPageResponse getDeveloperFlags(UUID workspaceId, int page, int size) {
        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        workspaceId,
                        loggedInUser
                ).orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        Workspace workspace = member.getWorkspace();

        Pageable pageable = PageRequest.of(page, size);

        List<FeatureStatus> developerActionStatuses = List.of(
                FeatureStatus.IN_DEVELOPMENT,
                FeatureStatus.QA_REJECTED
        );

        Page<Feature> featurePage = featureRepository.findAllByWorkspaceAndCreatedByAndStatusIn(
                workspace,
                loggedInUser,
                developerActionStatuses,
                pageable
        );

        List<FeatureSummaryResponse> featureSummaryResponsesList = new ArrayList<>();

        for (Feature feature : featurePage.getContent()) {
            FeatureSummaryResponse featureSummaryResponse = FeatureSummaryResponse.builder()
                    .featureId(feature.getId())
                    .name(feature.getName())
                    .description(feature.getDescription())
                    .status(feature.getStatus())
                    .createdAt(feature.getCreatedAt())
                    .isEnabled(false)
                    .build();

            featureSummaryResponsesList.add(featureSummaryResponse);
        }

        return FeaturesPageResponse.builder()
                .success(true)
                .message("Developer flags fetched successfully")
                .page(featurePage.getNumber())
                .size(featurePage.getSize())
                .totalElements(featurePage.getTotalElements())
                .isLast(featurePage.isLast())
                .features(featureSummaryResponsesList)
                .build();
    }

    @Transactional
    public FeatureProductionScheduleDeleteResponse deleteScheduledFeatureInProduction(int featureId, int scheduleId, DeleteScheduledFeatureRequest deleteScheduledFeatureRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        deleteScheduledFeatureRequest.getWorkspaceId(),
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

        if (feature.getStatus() != FeatureStatus.IN_PRODUCTION) {
            throw new InvalidFeatureStatusException(
                    "Feature is not in PRODUCTION."
            );
        }

        FeatureSchedule schedule = featureScheduleRepository
                .findByIdAndFeature_Id(scheduleId, featureId)
                .orElseThrow(
                        () -> new FeatureScheduleNotFoundException(
                                "Scheduled action not found for this feature."
                        )
                );

        if (schedule.getStatus() != ScheduleStatus.PENDING) {
            throw new InvalidScheduleStatusException(
                    "Only pending scheduled actions can be cancelled."
            );
        }

        featureScheduleRepository.delete(schedule);

        FeatureProductionScheduleDeleteResponse response = new FeatureProductionScheduleDeleteResponse();
        response.setSuccess(true);
        response.setMessage("Scheduled action cancelled successfully.");
        response.setFeatureId(feature.getId());

        return response;

    }
}
