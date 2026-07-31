package com.featureforge.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Builder;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Builder
public class FeatureEnvironmentConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "feature_id", nullable = false)
    private Feature feature;

    @ManyToOne
    @JoinColumn(name = "environment_id", nullable = false)
    private Environment environment;

    @Min(value = 0, message = "Rollout percentage cannot be less than 0")
    @Max(value = 100, message = "Rollout percentage cannot exceed 100")
    private Integer rolloutPercentage;

    @Column(nullable = false)
    private boolean isEnabled;

    @UpdateTimestamp
    private LocalDateTime localDateTime;
}
