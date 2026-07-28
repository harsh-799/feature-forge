package com.featureforge.backend.entity;

import com.featureforge.backend.enums.Role;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class WorkspaceMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    private Workspace workspace;

    @ManyToOne
    private User user;

    @Enumerated(EnumType.STRING)
    private Role role;
}
