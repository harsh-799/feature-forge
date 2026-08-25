package com.featureforge.backend.repository;

import com.featureforge.backend.dto.FeatureOverviewCount;
import com.featureforge.backend.dto.response.FeatureSummaryResponse;
import com.featureforge.backend.entity.Feature;
import com.featureforge.backend.entity.Workspace;
import com.featureforge.backend.enums.FeatureStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface FeatureRepository extends JpaRepository<Feature,Integer> {

    boolean existsByWorkspaceAndName(Workspace workspace, String featureName);

    Optional<Feature> findByWorkspaceAndKey(Workspace workspace, String featureKey);

    void deleteByWorkspace(Workspace workspace);

    @Query("""
            SELECT new com.featureforge.backend.dto.FeatureOverviewCount(
                COUNT(DISTINCT CASE WHEN f.status = 'IN_PRODUCTION' AND e.name = 'PRODUCTION' AND c.isEnabled = true THEN f.id END),
                COUNT(DISTINCT CASE WHEN f.status = 'IN_DEVELOPMENT' THEN f.id END),
                COUNT(DISTINCT CASE WHEN f.status IN ('READY_FOR_QA', 'QA_VERIFIED', 'QA_REJECTED') THEN f.id END),
                COUNT(DISTINCT CASE WHEN f.status = 'IN_PRODUCTION' THEN f.id END)
            )
            FROM Feature f
            LEFT JOIN FeatureEnvironmentConfig c ON c.feature = f
            LEFT JOIN c.environment e
            WHERE f.workspace = :workspace
            """)
    FeatureOverviewCount findFeatureCountForOverview(@Param("workspace") Workspace workspace);
}
