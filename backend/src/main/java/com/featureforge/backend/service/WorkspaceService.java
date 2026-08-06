package com.featureforge.backend.service;

import com.featureforge.backend.dto.request.AcceptMemberRequest;
import com.featureforge.backend.dto.request.InviteMemberRequest;
import com.featureforge.backend.dto.request.WorkspaceCreationRequest;
import com.featureforge.backend.dto.response.AcceptMemberResponse;
import com.featureforge.backend.dto.response.InviteMemberResponse;
import com.featureforge.backend.dto.response.WorkspaceCreationResponse;
import com.featureforge.backend.entity.*;
import com.featureforge.backend.enums.EnvironmentName;
import com.featureforge.backend.enums.InvitationStatus;
import com.featureforge.backend.enums.Role;
import com.featureforge.backend.exception.*;
import com.featureforge.backend.repository.*;
import com.featureforge.backend.util.ApiKeyManager;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;


@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMembershipRepository workspaceMembershipRepository;
    private final UserRepository userRepository;
    private final WorkspaceInvitationRepository workspaceInvitationRepository;
    private final EnvironmentRepository environmentRepository;
    private final ApiKeyManager apiKeyManager;
    private final EmailService emailService;
    private final FeatureRepository featureRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ActivityLogger activityLogger;

    @Value("${invitation.expiry.days}")
    private int INVITATION_EXPIRY_DAYS;

    private User fetchAuthenticatedUser() {
        CustomUserDetails customUserDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        return customUserDetails.getUser();

    }

    private String createDefaultEnvironment(Workspace workspace, EnvironmentName environmentName) {
        Environment environment = new Environment();

        environment.setWorkspace(workspace);
        environment.setName(environmentName);

        String apiKey = "ff_" + UUID.randomUUID();
        String hashedApiKey = apiKeyManager.hashApiKey(apiKey);

        environment.setApiKeyHash(hashedApiKey);

        environmentRepository.save(environment);
        return apiKey;
    }

    @Transactional
    public WorkspaceCreationResponse createWorkspace(WorkspaceCreationRequest workspaceCreationRequest) {

        User user = fetchAuthenticatedUser();

        boolean alreadyExists = workspaceMembershipRepository
                .existsByUserAndRoleAndWorkspace_Name(
                        user,
                        Role.ADMIN,
                        workspaceCreationRequest.getWorkspaceName()
                );

        if (alreadyExists)
            throw new WorkspaceAlreadyExistsException("You already own a workspace with this name.");

        Workspace workspace = new Workspace();
        workspace.setName(workspaceCreationRequest.getWorkspaceName());

        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceMembership workspaceMembership = new WorkspaceMembership();
        workspaceMembership.setWorkspace(savedWorkspace);
        workspaceMembership.setUser(user);
        workspaceMembership.setRole(Role.ADMIN);

        workspaceMembershipRepository.save(workspaceMembership);

        Map<EnvironmentName, String> environmentMap = new HashMap<>();

        environmentMap.put(EnvironmentName.DEVELOPMENT, createDefaultEnvironment(workspace,EnvironmentName.DEVELOPMENT));
        environmentMap.put(EnvironmentName.STAGING, createDefaultEnvironment(workspace,EnvironmentName.STAGING));
        environmentMap.put(EnvironmentName.PRODUCTION, createDefaultEnvironment(workspace,EnvironmentName.PRODUCTION));

        return WorkspaceCreationResponse.builder()
                .status(true)
                .message("workspace created successfully")
                .workspaceId(savedWorkspace.getId())
                .apiKeys(environmentMap)
                .build();
    }

    public InviteMemberResponse inviteMemberToWorkspace(InviteMemberRequest inviteMemberRequest) {

        User user = fetchAuthenticatedUser();

        // Getting the user with respective workspace
        WorkspaceMembership membership = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(
                        inviteMemberRequest.getWorkspaceId(),
                        user)
                .orElseThrow(() ->
                        new AccessDeniedException("You don't have access to this workspace."));

        // Getting the workspace
        Workspace workspace = membership.getWorkspace();

        // Checking if the authenticated user is ADMIN or not.
        if (membership.getRole() != Role.ADMIN)
            throw new InsufficientPrivilegesException("Only admins can invite new users.");

        boolean isAlreadyMember = workspaceMembershipRepository.existsByWorkspaceIdAndUserEmail(
                inviteMemberRequest.getWorkspaceId(),
                inviteMemberRequest.getEmail()
        );

        if (isAlreadyMember)
            throw new UserAlreadyMemberException("The user is already a member of this workspace.");

        boolean pendingInvitationExists = workspaceInvitationRepository.existsByWorkspaceIdAndEmailAndStatus(
                inviteMemberRequest.getWorkspaceId(),
                inviteMemberRequest.getEmail(),
                InvitationStatus.PENDING
        );

        if (pendingInvitationExists)
            throw new PendingInvitationAlreadyExistsException("A pending invitation already exists for this email.");

        UUID token = UUID.randomUUID();

        WorkspaceInvitation workspaceInvitation = WorkspaceInvitation.builder()
                .workspace(workspace)
                .email(inviteMemberRequest.getEmail())
                .role(inviteMemberRequest.getRole())
                .status(InvitationStatus.PENDING)
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(INVITATION_EXPIRY_DAYS))
                .build();

        workspaceInvitationRepository.save(workspaceInvitation);

        emailService.sendWorkspaceInvitation(
                workspaceInvitation.getEmail(),
                user.getFullname() != null && !user.getFullname().trim().isEmpty() ? user.getFullname() : user.getEmail(),
                workspace.getName(),
                workspaceInvitation.getRole().name(),
                token.toString()
        );

        activityLogger.logActivity(
                workspace.getId(),
                "MEMBER_INVITED",
                inviteMemberRequest.getEmail() + " (" + inviteMemberRequest.getRole().name() + ")",
                user.getFullname() != null && !user.getFullname().trim().isEmpty() ? user.getFullname() : user.getEmail()
        );

        return new InviteMemberResponse(
                true,
                "Invitation has been sent successfully."
        );

    }

    @Transactional
    public AcceptMemberResponse acceptMemberForWorkspace(AcceptMemberRequest acceptMemberRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceInvitation invitation = workspaceInvitationRepository.findByToken(
                acceptMemberRequest.getToken()
        ).orElseThrow(() -> new InvalidInviteTokenException("Token is invalid"));

        boolean isAlreadyMember = workspaceMembershipRepository.existsByWorkspaceIdAndUserEmail(
                invitation.getWorkspace().getId(),
                loggedInUser.getEmail()
        );

        if (isAlreadyMember)
            throw new UserAlreadyMemberException("The user is already a member of this workspace.");

        if (invitation.getStatus() != InvitationStatus.PENDING)
            throw new InvalidInvitationStateException("Invitation is not in a pending state. Action cannot be performed.");

        if (LocalDateTime.now().isAfter(invitation.getExpiresAt()))
            throw new TokenAlreadyExpiredException("Token has already expired. Please request a new invitation.");

        if (!loggedInUser.getEmail().equals(invitation.getEmail()))
            throw new UnauthorizedInvitationAcceptanceException("Invitation cannot be accepted. This token was issued to a different user account.");

        WorkspaceMembership workspaceMembership = new WorkspaceMembership();
        workspaceMembership.setWorkspace(invitation.getWorkspace());
        workspaceMembership.setUser(loggedInUser);
        workspaceMembership.setRole(invitation.getRole());

        workspaceMembershipRepository.save(workspaceMembership);

        invitation.setStatus(InvitationStatus.ACCEPTED);

        activityLogger.logActivity(
                invitation.getWorkspace().getId(),
                "MEMBER_JOINED",
                loggedInUser.getEmail() + " as " + invitation.getRole().name(),
                loggedInUser.getFullname() != null && !loggedInUser.getFullname().trim().isEmpty() ? loggedInUser.getFullname() : loggedInUser.getEmail()
        );

        return new AcceptMemberResponse(
                true,
                "Invitation accepted successfully. You have joined the workspace."
        );
    }

    public java.util.List<com.featureforge.backend.dto.response.UserWorkspaceResponse> getUserWorkspaces() {
        User user = fetchAuthenticatedUser();
        return workspaceMembershipRepository.findByUser(user)
                .stream()
                .map(membership -> com.featureforge.backend.dto.response.UserWorkspaceResponse.builder()
                        .workspaceId(membership.getWorkspace().getId())
                        .workspaceName(membership.getWorkspace().getName())
                        .role(membership.getRole())
                        .build())
                .toList();
    }

    public java.util.List<com.featureforge.backend.dto.response.WorkspaceMemberResponse> getWorkspaceMembers(UUID workspaceId) {
        User loggedInUser = fetchAuthenticatedUser();

        // Check if the current user is a member of this workspace
        workspaceMembershipRepository.findByWorkspace_IdAndUser(workspaceId, loggedInUser)
                .orElseThrow(() -> new AccessDeniedException("Access denied: You are not a member of this workspace."));

        java.util.List<WorkspaceMembership> memberships = workspaceMembershipRepository.findByWorkspace_Id(workspaceId);
        java.util.List<com.featureforge.backend.dto.response.WorkspaceMemberResponse> responses = new java.util.ArrayList<>();

        for (WorkspaceMembership membership : memberships) {
            responses.add(com.featureforge.backend.dto.response.WorkspaceMemberResponse.builder()
                    .memberId(membership.getId())
                    .email(membership.getUser().getEmail())
                    .fullname(membership.getUser().getFullname())
                    .role(membership.getRole().name())
                    .build());
        }

        return responses;
    }

    public com.featureforge.backend.dto.response.WorkspaceInvitationDetailsResponse getInvitationDetails(UUID token) {
        java.util.Optional<WorkspaceInvitation> invitationOpt = workspaceInvitationRepository.findByToken(token);

        if (invitationOpt.isEmpty()) {
            return com.featureforge.backend.dto.response.WorkspaceInvitationDetailsResponse.builder()
                    .valid(false)
                    .message("Token is invalid")
                    .build();
        }

        WorkspaceInvitation invitation = invitationOpt.get();

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            return com.featureforge.backend.dto.response.WorkspaceInvitationDetailsResponse.builder()
                    .valid(false)
                    .workspaceId(invitation.getWorkspace().getId())
                    .workspaceName(invitation.getWorkspace().getName())
                    .invitedEmail(invitation.getEmail())
                    .status(invitation.getStatus().name())
                    .message("Invitation has already been " + invitation.getStatus().name().toLowerCase())
                    .build();
        }

        if (LocalDateTime.now().isAfter(invitation.getExpiresAt())) {
            return com.featureforge.backend.dto.response.WorkspaceInvitationDetailsResponse.builder()
                    .valid(false)
                    .workspaceId(invitation.getWorkspace().getId())
                    .workspaceName(invitation.getWorkspace().getName())
                    .invitedEmail(invitation.getEmail())
                    .status(InvitationStatus.PENDING.name())
                    .message("Invitation has expired")
                    .build();
        }

        // Fetch inviter name (first Admin of the workspace)
        java.util.List<WorkspaceMembership> memberships = workspaceMembershipRepository.findByWorkspace_Id(invitation.getWorkspace().getId());
        String inviterName = memberships.stream()
                .filter(m -> m.getRole() == Role.ADMIN)
                .map(m -> m.getUser().getFullname())
                .findFirst()
                .orElse("FeatureForge Admin");

        return com.featureforge.backend.dto.response.WorkspaceInvitationDetailsResponse.builder()
                .valid(true)
                .workspaceId(invitation.getWorkspace().getId())
                .workspaceName(invitation.getWorkspace().getName())
                .inviterName(inviterName)
                .invitedEmail(invitation.getEmail())
                .role(invitation.getRole().name())
                .status(invitation.getStatus().name())
                .message("Invitation is valid")
                .build();
    }

    public com.featureforge.backend.dto.response.WorkspaceOverviewResponse getWorkspaceOverview(UUID workspaceId) {
        User loggedInUser = fetchAuthenticatedUser();

        // Check if user is member of this workspace
        WorkspaceMembership membership = workspaceMembershipRepository.findByWorkspace_IdAndUser(workspaceId, loggedInUser)
                .orElseThrow(() -> new AccessDeniedException("Access denied: You are not a member of this workspace."));

        Workspace workspace = membership.getWorkspace();

        // Fetch counts from FeatureRepository
        long totalFeatureFlags = featureRepository.countByWorkspace(workspace);
        long inDevelopmentFlags = featureRepository.countByWorkspaceAndStatus(workspace, com.featureforge.backend.enums.FeatureStatus.IN_DEVELOPMENT);
        long waitingForQaFlags = featureRepository.countByWorkspaceAndStatus(workspace, com.featureforge.backend.enums.FeatureStatus.READY_FOR_QA);
        long inProductionFlags = featureRepository.countByWorkspaceAndStatus(workspace, com.featureforge.backend.enums.FeatureStatus.IN_PRODUCTION);
        long qaVerified = featureRepository.countByWorkspaceAndStatus(workspace, com.featureforge.backend.enums.FeatureStatus.QA_VERIFIED);
        long qaRejected = featureRepository.countByWorkspaceAndStatus(workspace, com.featureforge.backend.enums.FeatureStatus.QA_REJECTED);

        // Pipeline groupings
        long pipelineDevelopmentCount = inDevelopmentFlags + qaRejected;
        long pipelineStagingQaCount = waitingForQaFlags + qaVerified;
        long pipelineProductionCount = inProductionFlags;

        // Environments
        java.util.List<Environment> envList = environmentRepository.findByWorkspace(workspace);
        java.util.List<com.featureforge.backend.dto.response.WorkspaceOverviewResponse.EnvironmentStatusDTO> environments = envList.stream()
                .map(e -> com.featureforge.backend.dto.response.WorkspaceOverviewResponse.EnvironmentStatusDTO.builder()
                        .name(e.getName().name())
                        .status("Active")
                        .build())
                .toList();

        // If list is empty, default it to standard pipeline
        if (environments.isEmpty()) {
            environments = java.util.List.of(
                new com.featureforge.backend.dto.response.WorkspaceOverviewResponse.EnvironmentStatusDTO("DEVELOPMENT", "Active"),
                new com.featureforge.backend.dto.response.WorkspaceOverviewResponse.EnvironmentStatusDTO("STAGING", "Active"),
                new com.featureforge.backend.dto.response.WorkspaceOverviewResponse.EnvironmentStatusDTO("PRODUCTION", "Active")
            );
        }

        // Members grouping
        java.util.List<WorkspaceMembership> memberships = workspaceMembershipRepository.findByWorkspace_Id(workspaceId);
        java.util.Map<String, Long> teamRoleCounts = new java.util.HashMap<>();
        teamRoleCounts.put("ADMIN", memberships.stream().filter(m -> m.getRole() == Role.ADMIN).count());
        teamRoleCounts.put("DEVELOPER", memberships.stream().filter(m -> m.getRole() == Role.DEVELOPER).count());
        teamRoleCounts.put("QA", memberships.stream().filter(m -> m.getRole() == Role.QA).count());

        // Recent activities
        java.util.List<ActivityLog> recentActivitiesLogs = activityLogRepository.findFirst5ByWorkspaceIdOrderByTimestampDesc(workspaceId);
        java.util.List<com.featureforge.backend.dto.response.ActivityLogResponse> recentActivities = recentActivitiesLogs.stream()
                .map(l -> com.featureforge.backend.dto.response.ActivityLogResponse.builder()
                        .id(l.getId())
                        .action(l.getAction())
                        .context(l.getContext())
                        .actor(l.getActor())
                        .timestamp(l.getTimestamp())
                        .build())
                .toList();

        return com.featureforge.backend.dto.response.WorkspaceOverviewResponse.builder()
                .totalFeatureFlags(totalFeatureFlags)
                .inDevelopmentFlags(inDevelopmentFlags)
                .waitingForQaFlags(waitingForQaFlags)
                .inProductionFlags(inProductionFlags)
                .pipelineDevelopmentCount(pipelineDevelopmentCount)
                .pipelineStagingQaCount(pipelineStagingQaCount)
                .pipelineProductionCount(pipelineProductionCount)
                .environments(environments)
                .teamRoleCounts(teamRoleCounts)
                .recentActivities(recentActivities)
                .build();
    }

    public Page<com.featureforge.backend.dto.response.ActivityLogResponse> getWorkspaceActivity(
            UUID workspaceId, int page, int size) {
        User loggedInUser = fetchAuthenticatedUser();

        // Check if user is member of this workspace
        workspaceMembershipRepository.findByWorkspace_IdAndUser(workspaceId, loggedInUser)
                .orElseThrow(() -> new AccessDeniedException("Access denied: You are not a member of this workspace."));

        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logs = activityLogRepository.findByWorkspaceIdOrderByTimestampDesc(workspaceId, pageable);

        return logs.map(l -> com.featureforge.backend.dto.response.ActivityLogResponse.builder()
                .id(l.getId())
                .action(l.getAction())
                .context(l.getContext())
                .actor(l.getActor())
                .timestamp(l.getTimestamp())
                .build());
    }
}
