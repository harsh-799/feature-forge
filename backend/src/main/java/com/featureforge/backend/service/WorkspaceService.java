package com.featureforge.backend.service;

import com.featureforge.backend.dto.request.WorkspaceCreationRequest;
import com.featureforge.backend.dto.response.WorkspaceCreationResponse;
import com.featureforge.backend.entity.User;
import com.featureforge.backend.entity.Workspace;
import com.featureforge.backend.entity.WorkspaceMembership;
import com.featureforge.backend.enums.Role;
import com.featureforge.backend.repository.WorkspaceMembershipRepository;
import com.featureforge.backend.repository.WorkspaceRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMembershipRepository workspaceMembershipRepository;

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
}
