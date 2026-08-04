package com.featureforge.backend.repository;

import com.featureforge.backend.entity.FeatureSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeatureScheduleRepository extends JpaRepository<FeatureSchedule, Integer> {
}
