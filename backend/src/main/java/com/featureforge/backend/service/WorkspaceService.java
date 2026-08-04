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


@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMembershipRepository workspaceMembershipRepository;
    private final UserRepository userRepository;
    private final WorkspaceInvitationRepository workspaceInvitationRepository;
    private final EnvironmentRepository environmentRepository;
    private final ApiKeyManager apiKeyManager;

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

        return new AcceptMemberResponse(
                true,
                "Invitation accepted successfully. You have joined the workspace."
        );
    }
}
