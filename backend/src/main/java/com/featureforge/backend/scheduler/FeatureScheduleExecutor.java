package com.featureforge.backend.scheduler;

import com.featureforge.backend.entity.FeatureEnvironmentConfig;
import com.featureforge.backend.entity.FeatureSchedule;
import com.featureforge.backend.enums.ScheduleStatus;
import com.featureforge.backend.exception.FeatureEnvironmentConfigNotFoundException;
import com.featureforge.backend.exception.FeatureNotEnabledException;
import com.featureforge.backend.repository.FeatureEnvironmentConfigRepository;
import com.featureforge.backend.repository.FeatureScheduleRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@AllArgsConstructor
public class FeatureScheduleExecutor {

    private final FeatureScheduleRepository featureScheduleRepository;
    private final FeatureEnvironmentConfigRepository featureEnvironmentConfigRepository;

    @Scheduled(fixedDelay = 10000)
    @Transactional
    public void executeScheduledChanges() {

        List<FeatureSchedule> dueSchedules =
                featureScheduleRepository
                        .findByStatusAndScheduledAtLessThanEqual(
                                ScheduleStatus.PENDING,
                                LocalDateTime.now()
                        );

        for (FeatureSchedule schedule : dueSchedules) {

            try {
                executeSchedule(schedule);
                schedule.setStatus(ScheduleStatus.EXECUTED);

            } catch (Exception e) {
                schedule.setStatus(ScheduleStatus.FAILED);
            }
        }
    }

    private void executeSchedule(FeatureSchedule schedule) {

        FeatureEnvironmentConfig config =
                featureEnvironmentConfigRepository
                        .findByFeature_IdAndEnvironment_Name(
                                schedule.getFeature().getId(),
                                schedule.getEnvironment().getName()
                        )
                        .orElseThrow(
                                () -> new FeatureEnvironmentConfigNotFoundException(
                                        "Environment configuration not found for scheduled feature."
                                )
                        );

        switch (schedule.getAction()) {

            case ACTIVATE -> {
                config.setEnabled(true);
                config.setRolloutPercentage(
                        schedule.getRolloutPercentage()
                );
            }

            case UPDATE_ROLLOUT -> {
                if (!config.isEnabled()) {
                    throw new FeatureNotEnabledException(
                            "Cannot update rollout because feature is not active."
                    );
                }

                config.setRolloutPercentage(
                        schedule.getRolloutPercentage()
                );
            }

            case DEACTIVATE -> {
                if (!config.isEnabled()) {
                    throw new FeatureNotEnabledException(
                            "Feature is already inactive."
                    );
                }

                config.setEnabled(false);
            }
        }
    }
}
