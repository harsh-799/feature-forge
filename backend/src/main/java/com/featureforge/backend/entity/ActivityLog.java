package com.featureforge.backend.entity;

import com.featureforge.backend.enums.ActivityType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @CreationTimestamp
    private LocalDateTime createdAt;
}
