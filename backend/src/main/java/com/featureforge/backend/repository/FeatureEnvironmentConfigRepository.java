package com.featureforge.backend.repository;

import com.featureforge.backend.entity.Feature;
import com.featureforge.backend.entity.FeatureEnvironmentConfig;
import com.featureforge.backend.entity.Workspace;
import com.featureforge.backend.enums.EnvironmentName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface FeatureEnvironmentConfigRepository extends JpaRepository<FeatureEnvironmentConfig, Integer> {

    Optional<FeatureEnvironmentConfig> findByFeature_IdAndEnvironment_Name(int featureId, EnvironmentName environmentName);

    @Modifying
    @Query("""
            DELETE FROM
            FeatureEnvironmentConfig fec
            where fec.feature.workspace.id = :workspaceId
            """)
    void deleteByWorkspaceId(UUID workspaceId);

    void deleteByFeature(Feature feature);
}
