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

        return FeatureCreationResponse.builder()
                .featureId(savedFeature.getId())
                .name(savedFeature.getName())
                .description(savedFeature.getDescription())
                .status(savedFeature.getStatus())
                .createdAt(savedFeature.getCreatedAt())
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

        if (feature.getStatus() == FeatureStatus.IN_PRODUCTION) {
            throw new FeatureInProductionException(
                    "Cannot delete an active production feature. Disable the feature before attempting to delete it."
            );
        }

        featureEnvironmentConfigRepository.deleteByFeature(feature);
        featureScheduleRepository.deleteByFeature(feature);

        featureRepository.deleteById(featureId);

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

        FeatureDetailsResponse featureDetailsResponse = FeatureDetailsResponse
                .builder()
                .id(feature.getId())
                .name(feature.getName())
                .key(feature.getKey())
                .description(feature.getDescription())
                .status(feature.getStatus())
                .rejectionReason(feature.getRejectionReason())
                .environments(featureEnvironmentList)
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

        FeatureActivationResponse featureActivationResponse = new FeatureActivationResponse();
        featureActivationResponse.setSuccess(true);
        featureActivationResponse.setMessage("Feature activated in staging.");
        featureActivationResponse.setFeatureId(feature.getId());


        return featureActivationResponse;
    }
}
