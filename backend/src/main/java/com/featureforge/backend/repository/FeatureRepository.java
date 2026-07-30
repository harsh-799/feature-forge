package com.featureforge.backend.repository;

import com.featureforge.backend.entity.Feature;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeatureRepository extends JpaRepository<Feature,Integer> {
}
