package com.featureforge.backend.repository;

import com.featureforge.backend.dto.response.FeatureSummaryResponse;
import com.featureforge.backend.entity.Feature;
import com.featureforge.backend.entity.Workspace;
import com.featureforge.backend.enums.FeatureStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FeatureRepository extends JpaRepository<Feature,Integer> {

    boolean existsByWorkspaceAndName(Workspace workspace, String featureName);

    Page<Feature> findByWorkspace(Workspace workspace, Pageable pageable);

    Page<Feature> findByWorkspaceAndStatus(Workspace workspace, FeatureStatus status, Pageable pageable);

    Page<Feature> findByWorkspaceAndStatusAndNameContainingIgnoreCase(Workspace workspace, FeatureStatus status, String keyword, Pageable pageable);

    Page<Feature> findByWorkspaceAndNameContainingIgnoreCase(Workspace workspace, String keyword, Pageable pageable);

    Optional<Feature> findByWorkspaceAndKey(Workspace workspace, String featureKey);

    void deleteByWorkspace(Workspace workspace);
}
