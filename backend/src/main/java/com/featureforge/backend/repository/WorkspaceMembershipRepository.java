package com.featureforge.backend.repository;

import com.featureforge.backend.entity.User;
import com.featureforge.backend.entity.Workspace;
import com.featureforge.backend.entity.WorkspaceMembership;
import com.featureforge.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface WorkspaceMembershipRepository extends JpaRepository<WorkspaceMembership, Integer> {

    Optional<WorkspaceMembership> findByWorkspace_IdAndUser(UUID workspaceId, User user);

    boolean existsByWorkspaceIdAndUserEmail(UUID workspaceId, String email);

    boolean existsByUserAndRoleAndWorkspace_Name(User user, Role role, String workspaceName);

    int countByWorkspaceAndRole(Workspace workspace, Role role);

    int countByWorkspace(Workspace workspace);

}
