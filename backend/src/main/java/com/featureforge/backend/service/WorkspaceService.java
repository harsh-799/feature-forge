package com.featureforge.backend.service;

import com.featureforge.backend.dto.request.InviteMemberRequest;
import com.featureforge.backend.dto.request.WorkspaceCreationRequest;
import com.featureforge.backend.dto.response.InviteMemberResponse;
import com.featureforge.backend.dto.response.WorkspaceCreationResponse;
import com.featureforge.backend.entity.User;
import com.featureforge.backend.entity.Workspace;
import com.featureforge.backend.entity.WorkspaceInvitation;
import com.featureforge.backend.entity.WorkspaceMembership;
import com.featureforge.backend.enums.InvitationStatus;
import com.featureforge.backend.enums.Role;
import com.featureforge.backend.exception.*;
import com.featureforge.backend.repository.UserRepository;
import com.featureforge.backend.repository.WorkspaceInvitationRepository;
import com.featureforge.backend.repository.WorkspaceMembershipRepository;
import com.featureforge.backend.repository.WorkspaceRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;


@Service
@AllArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMembershipRepository workspaceMembershipRepository;
    private final UserRepository userRepository;
    private final WorkspaceInvitationRepository workspaceInvitationRepository;

    @Value("${invitation.expiry.days}")
    private final int INVITATION_EXPIRY_DAYS;

    private User fetchAuthenticatedUser() {
        CustomUserDetails customUserDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        return customUserDetails.getUser();

    }

    @Transactional
    public WorkspaceCreationResponse createWorkspace(WorkspaceCreationRequest workspaceCreationRequest) {

        User user = fetchAuthenticatedUser();

        Workspace workspace = new Workspace();
        workspace.setName(workspaceCreationRequest.getWorkspaceName());

        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceMembership workspaceMembership = new WorkspaceMembership();
        workspaceMembership.setWorkspace(savedWorkspace);
        workspaceMembership.setUser(user);
        workspaceMembership.setRole(Role.ADMIN);

        workspaceMembershipRepository.save(workspaceMembership);

        return WorkspaceCreationResponse.builder()
                .status(true)
                .message("workspace created successfully")
                .workspaceId(savedWorkspace.getId())
                .build();
    }

    public InviteMemberResponse inviteMemberToWorkspace(InviteMemberRequest inviteMemberRequest) {

        User user = fetchAuthenticatedUser();

        // Getting the user with respective workspace
        WorkspaceMembership membership = workspaceMembershipRepository
                .findByWorkspaceIdAndUser(
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
}
