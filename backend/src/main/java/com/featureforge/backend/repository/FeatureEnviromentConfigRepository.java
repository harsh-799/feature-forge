package com.featureforge.backend.repository;

import com.featureforge.backend.entity.FeatureEnvironmentConfig;
import com.featureforge.backend.enums.EnvironmentName;
import com.featureforge.backend.enums.FeatureStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FeatureEnviromentConfigRepository extends JpaRepository<FeatureEnvironmentConfig, Integer> {

    Optional<FeatureEnvironmentConfig> findByFeature_IdAndEnvironment_Name(int featureId, EnvironmentName environmentName);
}
