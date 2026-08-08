package com.featureforge.backend.repository;

import com.featureforge.backend.entity.User;
import com.featureforge.backend.entity.Workspace;
import com.featureforge.backend.entity.WorkspaceMembership;
import com.featureforge.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceMembershipRepository extends JpaRepository<WorkspaceMembership, Integer> {

    Optional<WorkspaceMembership> findByWorkspace_IdAndUser(UUID workspaceId, User user);

    boolean existsByWorkspaceIdAndUserEmail(UUID workspaceId, String email);

    boolean existsByUserAndRoleAndWorkspace_Name(User user, Role role, String workspaceName);

    int countByWorkspaceAndRole(Workspace workspace, Role role);

    int countByWorkspace(Workspace workspace);

    void deleteByWorkspace(Workspace workspace);

    @Query("""
            SELECT wm
            FROM WorkspaceMembership wm
            WHERE
                wm.workspace.id = :workspaceId
            AND
                (:role IS NULL OR wm.role = :role)
            AND
                LOWER(wm.user.fullname) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR
                LOWER(wm.user.email) LIKE LOWER(CONCAT('%', :keyword, '%'))  
            ORDER BY wm.role ASC, wm.user.fullname ASC
            """)
    List<WorkspaceMembership> findMembers(
            @Param("workspaceId") UUID workspaceId,
            @Param("role") Role role,
            @Param("keyword") String keyword
    );
}
