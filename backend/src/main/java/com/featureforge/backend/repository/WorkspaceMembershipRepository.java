package com.featureforge.backend.repository;

import com.featureforge.backend.entity.WorkspaceMembership;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceMembershipRepository extends JpaRepository<WorkspaceMembership, Integer> {
}
