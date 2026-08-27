package com.featureforge.backend.repository;

import com.featureforge.backend.entity.Feature;
import com.featureforge.backend.entity.FeatureSchedule;
import com.featureforge.backend.enums.ScheduleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FeatureScheduleRepository extends JpaRepository<FeatureSchedule, Integer> {

    List<FeatureSchedule> findByStatusAndScheduledAtLessThanEqual(
            ScheduleStatus status,
            LocalDateTime scheduledAt
    );

    void deleteByFeature(Feature feature);

    List<FeatureSchedule> findByFeatureAndStatus(Feature feature, ScheduleStatus status);

}
