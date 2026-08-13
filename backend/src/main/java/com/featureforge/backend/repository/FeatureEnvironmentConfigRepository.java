package com.featureforge.backend.repository;

import com.featureforge.backend.entity.Feature;
import com.featureforge.backend.entity.FeatureEnvironmentConfig;
import com.featureforge.backend.entity.Workspace;
import com.featureforge.backend.enums.EnvironmentName;
import com.featureforge.backend.enums.FeatureStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
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

    List<FeatureEnvironmentConfig> findAllByFeatureOrderByEnvironment_IdAsc(Feature feature);

    @Query("""
            SELECT fec FROM
            FeatureEnvironmentConfig fec
            WHERE fec.environment.name = :environment
            AND
            fec.feature.workspace.id = :workspaceId
            AND 
            (
                    (
                        :environment = 'DEVELOPMENT'
                        AND fec.feature.status IN ('IN_DEVELOPMENT', 'QA_REJECTED')
                    )
                    OR
                    (
                        :environment = 'STAGING'
                        AND fec.feature.status IN ('READY_FOR_QA', 'QA_VERIFIED')
                    )
                    OR
                    (
                        :environment = 'PRODUCTION'
                        AND fec.feature.status = 'IN_PRODUCTION'
                    )  
            )
            AND
            (
                :status IS NULL
                OR
                fec.feature.status = :status
            )
            AND
                LOWER(fec.feature.name) LIKE CONCAT('%', LOWER(:keyword), '%')
            ORDER BY
            fec.feature.createdAt DESC
            """)
    Page<FeatureEnvironmentConfig> findAllEnvironmentRelatedFeatures(
            @Param("environment") EnvironmentName environmentName,
            @Param("workspaceId") UUID workspaceId,
            @Param("status") FeatureStatus status,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
