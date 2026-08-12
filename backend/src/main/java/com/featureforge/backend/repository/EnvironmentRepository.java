package com.featureforge.backend.repository;

import com.featureforge.backend.entity.Environment;
import com.featureforge.backend.entity.Workspace;
import com.featureforge.backend.enums.EnvironmentName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnvironmentRepository extends JpaRepository<Environment, Integer> {

    Optional<Environment> findByWorkspaceAndName(Workspace workspace, EnvironmentName name);

    Optional<Environment> findByApiKeyHash(String apiKeyHash);

    void deleteByWorkspace(Workspace workspace);
}
