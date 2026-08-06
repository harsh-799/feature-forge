package com.featureforge.backend.repository;

import com.featureforge.backend.entity.User;
import com.featureforge.backend.entity.WorkspaceMembership;
import com.featureforge.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface WorkspaceMembershipRepository extends JpaRepository<WorkspaceMembership, Integer> {

    Optional<WorkspaceMembership> findByWorkspace_IdAndUser(UUID workspaceId, User user);

    boolean existsByWorkspaceIdAndUserEmail(UUID workspaceId, String email);

    boolean existsByUserAndRoleAndWorkspace_Name(User user, Role role, String workspaceName);

    java.util.List<WorkspaceMembership> findByUser(User user);

    @org.springframework.data.jpa.repository.Query("SELECT wm FROM WorkspaceMembership wm WHERE wm.workspace.id = :workspaceId")
    java.util.List<WorkspaceMembership> findByWorkspace_Id(@org.springframework.data.repository.query.Param("workspaceId") UUID workspaceId);
}
