package com.featureforge.backend.repository;

import com.featureforge.backend.entity.Workspace;
import com.featureforge.backend.entity.WorkspaceInvitation;
import com.featureforge.backend.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WorkspaceInvitationRepository extends JpaRepository<WorkspaceInvitation, Integer> {

    boolean existsByWorkspaceIdAndEmailAndStatus(UUID workspaceId, String email, InvitationStatus status);

    Optional<WorkspaceInvitation> findByToken(UUID token);

    void deleteByWorkspace(Workspace workspace);
}
