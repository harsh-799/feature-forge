package com.featureforge.backend.entity;

import com.featureforge.backend.enums.FeatureStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_workspace_feature_name",
                        columnNames = {"workspace_id", "name"}
                ),
                @UniqueConstraint(
                        name = "uk_workspace_feature_key",
                        columnNames = {"workspace_id", "feature_key"}
                )
        }
)
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Feature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Column(nullable = false)
    private String name;

    @Column(name = "feature_key", nullable = false, updatable = false)
    private String key;

    private String description;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeatureStatus status;

    private String rejectionReason;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;
}
