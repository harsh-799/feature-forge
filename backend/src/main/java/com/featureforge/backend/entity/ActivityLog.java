package com.featureforge.backend.entity;

import com.featureforge.backend.enums.ActivityType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Workspace workspace;

    @ManyToOne
    private User performedBy;

    @Enumerated(EnumType.STRING)
    private ActivityType activityType;

    private String description;

    private LocalDateTime createdAt;
}
