package com.featureforge.backend.service;

import com.featureforge.backend.dto.request.*;
import com.featureforge.backend.dto.response.*;
import com.featureforge.backend.entity.*;
import com.featureforge.backend.enums.ActivityType;
import com.featureforge.backend.enums.EnvironmentName;
import com.featureforge.backend.enums.InvitationStatus;
import com.featureforge.backend.enums.Role;
import com.featureforge.backend.exception.*;
import com.featureforge.backend.repository.*;
import com.featureforge.backend.util.ApiKeyManager;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;


@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMembershipRepository workspaceMembershipRepository;
    private final UserRepository userRepository;
    private final WorkspaceInvitationRepository workspaceInvitationRepository;
    private final EnvironmentRepository environmentRepository;
    private final ApiKeyManager apiKeyManager;
    private final FeatureRepository featureRepository;
    private final FeatureEnvironmentConfigRepository featureEnvironmentConfigRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ActivityLogService activityLogService;
    private final EmailService emailService;

    @Value("${invitation.expiry.days}")
    private int INVITATION_EXPIRY_DAYS;

    @Value("${brevo.frontend-url:http://localhost:5173}")
    private String frontendUrl;

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

        activityLogService.log(savedWorkspace, user, ActivityType.WORKSPACE_CREATED, "Created workspace '" + savedWorkspace.getName() + "'.");

        return WorkspaceCreationResponse.builder()
                .status(true)
                .message("workspace created successfully")
                .workspaceId(savedWorkspace.getId())
                .apiKeys(environmentMap)
                .build();
    }

    @Transactional
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

        String inviteLink = frontendUrl + "/accept-invite?token=" + token;

        emailService.sendWorkspaceInvitation(
                inviteMemberRequest.getEmail(),
                workspace.getName(),
                inviteMemberRequest.getRole().toString(),
                inviteLink,
                user.getFullname()
        );

        activityLogService.log(workspace, user, ActivityType.MEMBER_INVITED, "Invited " + inviteMemberRequest.getEmail() + " as " + inviteMemberRequest.getRole() + ".");

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
        ).orElseThrow(() -> new InvalidInviteTokenException("The invite token isn't valid."));

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

        activityLogService.log(invitation.getWorkspace(), loggedInUser, ActivityType.INVITATION_ACCEPTED, "Accepted invitation to join workspace.");

        return new AcceptMemberResponse(
                true,
                "Invitation accepted successfully. You have joined the workspace."
        );
    }

    @Transactional
    public WorkspaceMemberDeletionResponse removeMemberForWorkspace(UUID workspaceId, int memberId) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(workspaceId, loggedInUser)
                .orElseThrow(
                        () -> new AccessDeniedException("You don't have access to this workspace.")
                );


        if (member.getRole() != Role.ADMIN)
            throw new InsufficientPrivilegesException("Only admins can remove users.");

        User userToRemove = userRepository.findById(memberId).orElseThrow(
                () -> new UserDoesNotExistException("No user found with the Id: " + memberId)
        );

        if (loggedInUser.getId().equals(userToRemove.getId())) {
            throw new InvalidWorkspaceOperationException(
                    "You cannot remove yourself from the workspace."
            );
        }

        Workspace workspace = member.getWorkspace();

        WorkspaceMembership membershipToRemove = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(workspaceId,userToRemove)
                .orElseThrow(
                        () -> new UserNotInWorkspaceException
                                ("Cannot remove user: This user is not a member of this workspace.")
                );

        if (membershipToRemove.getRole() == Role.ADMIN) {
            int adminCount = workspaceMembershipRepository
                    .countByWorkspaceAndRole(workspace, Role.ADMIN);

            if (adminCount <= 1) throw new CannotRemoveLastAdminException("Cannot remove user. Workspace must have at least one admin.");
        }

        workspaceMembershipRepository.delete(membershipToRemove);

        activityLogService.log(workspace, loggedInUser, ActivityType.MEMBER_REMOVED, "Removed member " + userToRemove.getEmail() + ".");

        return WorkspaceMemberDeletionResponse
                .builder()
                .success(true)
                .message("Member successfully removed from the workspace")
                .name(userToRemove.getFullname())
                .userId(userToRemove.getId())
                .build();
    }

    @Transactional
    public WorkspaceUpdationResponse renameWorkspace(UUID workspaceId, WorkspaceUpdationRequest workspaceUpdationRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(workspaceId, loggedInUser)
                .orElseThrow(
                        () -> new AccessDeniedException("You don't have access to this workspace.")
                );

        if (member.getRole() != Role.ADMIN)
            throw new InsufficientPrivilegesException("Only admins can rename the workspace.");

        Workspace workspaceToRename = member.getWorkspace();

        String oldName = workspaceToRename.getName();
        workspaceToRename.setName(workspaceUpdationRequest.getWorkspaceName());

        activityLogService.log(workspaceToRename, loggedInUser, ActivityType.WORKSPACE_RENAMED, "Renamed workspace from '" + oldName + "' to '" + workspaceToRename.getName() + "'.");

       return WorkspaceUpdationResponse.builder()
               .success(true)
               .message("Workspace renamed successfully.")
               .workspaceName(workspaceToRename.getName().trim())
               .build();
    }

    @Transactional
    public WorkspaceMemberDeletionResponse leaveWorkspace(UUID workspaceId) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member =  workspaceMembershipRepository
                .findByWorkspace_IdAndUser(workspaceId, loggedInUser)
                .orElseThrow(
                        () -> new AccessDeniedException("You don't have access to this workspace.")
                );

        Workspace memberWorkspace = member.getWorkspace();

        int memberCountInWorkspace = workspaceMembershipRepository.countByWorkspace(memberWorkspace);

        if (memberCountInWorkspace == 1)
            throw new CannotLeaveWorkspaceException("You are the only member of this workspace. Delete the workspace instead.");

        if (member.getRole() == Role.ADMIN) {

            int adminCount = workspaceMembershipRepository
                    .countByWorkspaceAndRole(memberWorkspace, Role.ADMIN);

            if (adminCount == 1) {
                throw new CannotLeaveWorkspaceException(
                        "You are the last admin. Promote another member before leaving.");
            }
        }

        workspaceMembershipRepository.delete(member);

        activityLogService.log(memberWorkspace, loggedInUser, ActivityType.MEMBER_LEFT, "Left the workspace.");

        return WorkspaceMemberDeletionResponse.builder()
                .success(true)
                .userId(loggedInUser.getId())
                .name(loggedInUser.getFullname())
                .message("You have successfully left the workspace.")
                .build();

    }

    @Transactional
    public WorkspaceDeletionResponse deleteWorkspace(UUID workspaceId) {
        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership member =  workspaceMembershipRepository
                .findByWorkspace_IdAndUser(workspaceId, loggedInUser)
                .orElseThrow(
                        () -> new AccessDeniedException("You don't have access to this workspace.")
                );

        if (member.getRole() != Role.ADMIN)
            throw new InsufficientPrivilegesException("Only admins can delete the workspace.");

        Workspace memberWorkspace = member.getWorkspace();

        featureEnvironmentConfigRepository.deleteByWorkspaceId(memberWorkspace.getId());
        featureRepository.deleteByWorkspace(memberWorkspace);
        environmentRepository.deleteByWorkspace(memberWorkspace);

        activityLogService.log(memberWorkspace, loggedInUser, ActivityType.WORKSPACE_DELETED, "Deleted workspace '" + memberWorkspace.getName() + "'.");

        activityLogRepository.deleteByWorkspace(memberWorkspace);
        workspaceInvitationRepository.deleteByWorkspace(memberWorkspace);
        workspaceMembershipRepository.deleteByWorkspace(memberWorkspace);

        workspaceRepository.delete(memberWorkspace);

        return WorkspaceDeletionResponse.builder()
                .success(true)
                .message("Workspace deleted successfully.")
                .workspaceName(memberWorkspace.getName())
                .workspaceId(memberWorkspace.getId())
                .build();
    }

    public WorkspaceMemberResponse getMembersOfWorkspace(UUID workspaceId, Role role, String keyword) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership loggedInMembership =  workspaceMembershipRepository
                .findByWorkspace_IdAndUser(workspaceId, loggedInUser)
                .orElseThrow(
                        () -> new AccessDeniedException("You don't have access to this workspace.")
                );

        if (loggedInMembership.getRole() != Role.ADMIN)
            throw new InsufficientPrivilegesException("Only admins can view all the members of workspace.");

        Workspace workspace = loggedInMembership.getWorkspace();

        String normalizedKeyword = (keyword == null) ? "" : keyword.trim();

        List<WorkspaceMembership> workspaceMembershipList = workspaceMembershipRepository
                .findMembers(workspaceId, role, normalizedKeyword);

        List<WorkspaceMemberDetails> membersData = new ArrayList<>();

        for (WorkspaceMembership workspaceMember: workspaceMembershipList) {
            WorkspaceMemberDetails memberDetails = new WorkspaceMemberDetails();

            memberDetails.setUserId(workspaceMember.getUser().getId());
            memberDetails.setRole(workspaceMember.getRole());
            memberDetails.setName(workspaceMember.getUser().getFullname());
            memberDetails.setEmail(workspaceMember.getUser().getEmail());

            membersData.add(memberDetails);
        }

        WorkspaceMemberResponse workspaceMemberResponse = new WorkspaceMemberResponse();
        workspaceMemberResponse.setSuccess(true);
        workspaceMemberResponse.setMessage("Workspace members fetched successfully.");
        workspaceMemberResponse.setMembersData(membersData);

        return workspaceMemberResponse;
    }

    public WorkspaceInvitationResponse getInvitationsForWorkspace(UUID workspaceId, InvitationStatus status) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership membership = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(workspaceId,loggedInUser)
                .orElseThrow(
                        () ->  new AccessDeniedException("You don't have access to this workspace.")
                );

        if (membership.getRole() != Role.ADMIN)
            throw new InsufficientPrivilegesException("Only admins can view all the members of workspace.");

        Workspace workspace = membership.getWorkspace();

        List<WorkspaceInvitation> invitationList = workspaceInvitationRepository
                .findAllByWorkspaceAndStatusOrderByCreatedAtDesc(
                workspace,
                status
        );

        List<WorkspaceInviteDetailsResponse> workspaceInviteDetails = new ArrayList<>();

        for (WorkspaceInvitation invitation : invitationList) {
            WorkspaceInviteDetailsResponse workspaceInviteDetailsResponse =
                    WorkspaceInviteDetailsResponse.builder()
                            .id(invitation.getId())
                            .email(invitation.getEmail())
                            .role(invitation.getRole())
                            .invitedAt(invitation.getCreatedAt())
                            .build();

            workspaceInviteDetails.add(workspaceInviteDetailsResponse);
        }

        WorkspaceInvitationResponse workspaceInvitationResponse = new WorkspaceInvitationResponse();
        workspaceInvitationResponse.setSuccess(true);
        workspaceInvitationResponse.setMessage("Workspace invitations retrieved successfully");
        workspaceInvitationResponse.setData(workspaceInviteDetails);

        return workspaceInvitationResponse;
    }

    @Transactional
    public RevokeInvitationResponse revokeInvitationForWorkspace(UUID workspaceId, int invitationId) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership membership = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(workspaceId,loggedInUser)
                .orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        if (membership.getRole() != Role.ADMIN)
            throw new InsufficientPrivilegesException("Only admins can revoke workspace invitations.");

        WorkspaceInvitation invitation = workspaceInvitationRepository
                .findById(invitationId)
                .orElseThrow(
                        () -> new WorkspaceInvitationNotFoundException("Invitation not found.")
                );

        if (!invitation.getWorkspace().getId().equals(workspaceId))
            throw new WorkspaceMismatchException("Invitation does not belong to this workspace.");

        if (invitation.getStatus() != InvitationStatus.PENDING)
            throw new InvitationNotPendingException("This invitation has already been processed or has expired.");

        workspaceInvitationRepository.delete(invitation);

        activityLogService.log(membership.getWorkspace(), loggedInUser, ActivityType.INVITATION_REVOKED, "Revoked invitation for " + invitation.getEmail() + ".");

        RevokeInvitationResponse revokeInvitationResponse = new RevokeInvitationResponse();
        revokeInvitationResponse.setSuccess(true);
        revokeInvitationResponse.setMessage("Invitation revoked successfully");
        revokeInvitationResponse.setEmail(invitation.getEmail());

        return revokeInvitationResponse;
    }

    @Transactional
    public RegenerateApiKeyResponse regenerateApiKeysForWorkspace(UUID workspaceId, RegenerateApiKeyRequest regenerateApiKeyRequest) {

        User loggedInUser = fetchAuthenticatedUser();

        WorkspaceMembership membership = workspaceMembershipRepository
                .findByWorkspace_IdAndUser(workspaceId,loggedInUser)
                .orElseThrow(
                        () -> new AccessDeniedException("Access denied: You are not a member of this workspace.")
                );

        if (membership.getRole() != Role.ADMIN)
            throw new InsufficientPrivilegesException("Only admins can re-generate the API Keys.");

        Workspace workspace = membership.getWorkspace();

        Environment environment = environmentRepository.findByWorkspaceAndName(
                workspace,
                regenerateApiKeyRequest.getEnvironmentName())
                .orElseThrow(
                        () -> new InvalidEnvironmentException("The requested environment does not exist")
                );

        String newApiKey = "ff_" + UUID.randomUUID();
        String newHashedApiKey = apiKeyManager.hashApiKey(newApiKey);

        environment.setApiKeyHash(newHashedApiKey);

        activityLogService.log(workspace, loggedInUser, ActivityType.API_KEY_REGENERATED, "Regenerated API key for " + environment.getName().name() + " environment.");

        RegenerateApiKeyResponse regenerateApiKeyResponse = new RegenerateApiKeyResponse();
        regenerateApiKeyResponse.setSuccess(true);
        regenerateApiKeyResponse.setMessage("Successfully regenerated API key for the environment");
        regenerateApiKeyResponse.setApiKey(newApiKey);

        return regenerateApiKeyResponse;
    }

    public UserWorkspaceResponse getUserWorkspaces() {

        User loggedInUser = fetchAuthenticatedUser();

        List<WorkspaceMembership> userWorkspace = workspaceMembershipRepository
                .findAllByUserOrderByWorkspace_Name(loggedInUser);

        List<WorkspaceDetails> userWorkspacesList = new ArrayList<>();

        for (WorkspaceMembership workspace : userWorkspace) {
            WorkspaceDetails workspaceDetails = WorkspaceDetails
                    .builder()
                    .workspaceId(workspace.getWorkspace().getId())
                    .workspaceName(workspace.getWorkspace().getName())
                    .role(workspace.getRole())
                    .build();

            userWorkspacesList.add(workspaceDetails);
        }

        UserWorkspaceResponse userWorkspaceResponse = new UserWorkspaceResponse();
        userWorkspaceResponse.setSuccess(true);
        userWorkspaceResponse.setMessage("Workspaces fetched successfully.");
        userWorkspaceResponse.setData(userWorkspacesList);

        return userWorkspaceResponse;
    }
}
