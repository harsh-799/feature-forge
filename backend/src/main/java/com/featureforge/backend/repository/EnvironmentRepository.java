package com.featureforge.backend.repository;

import com.featureforge.backend.entity.Environment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnvironmentRepository extends JpaRepository<Environment, Integer> {
}
