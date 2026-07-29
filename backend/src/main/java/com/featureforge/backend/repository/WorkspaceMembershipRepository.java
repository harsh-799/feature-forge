package com.featureforge.backend.repository;

import com.featureforge.backend.entity.User;
import com.featureforge.backend.entity.WorkspaceMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface WorkspaceMembershipRepository extends JpaRepository<WorkspaceMembership, Integer> {

    Optional<WorkspaceMembership> findByWorkspaceIdAndUser(UUID workspaceId, User user);

    boolean existsByWorkspaceIdAndUserEmail(UUID workspaceId, String email);

}
