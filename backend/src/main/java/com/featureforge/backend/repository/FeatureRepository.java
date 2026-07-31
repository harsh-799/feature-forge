package com.featureforge.backend.repository;

import com.featureforge.backend.entity.Feature;
import com.featureforge.backend.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeatureRepository extends JpaRepository<Feature,Integer> {

    boolean existsByWorkspaceAndName(Workspace workspace, String featureName);
}
