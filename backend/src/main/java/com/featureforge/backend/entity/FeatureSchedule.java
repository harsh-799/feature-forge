package com.featureforge.backend.entity;

import com.featureforge.backend.enums.FeatureStatus;
import com.featureforge.backend.enums.ScheduleStatus;
import com.featureforge.backend.enums.ScheduledAction;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeatureSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Feature feature;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Environment environment;

    private Integer rolloutPercentage;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ScheduleStatus status;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ScheduledAction action;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
