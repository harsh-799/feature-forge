package com.featureforge.backend.repository;

import com.featureforge.backend.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface WorkspaceRepository extends JpaRepository<Workspace,UUID> {
}
