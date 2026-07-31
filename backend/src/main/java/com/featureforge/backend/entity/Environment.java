package com.featureforge.backend.entity;

import com.featureforge.backend.enums.EnvironmentName;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"workspace_id","name"}
                )
        }
)
@Getter
@Setter
public class Environment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "workspace_id",nullable = false)
    private Workspace workspace;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnvironmentName name;

    @Column(unique = true, nullable = false)
    private String apiKey;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
