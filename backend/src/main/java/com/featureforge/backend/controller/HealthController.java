package com.featureforge.backend.controller;

import com.featureforge.backend.dto.response.HealthResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> checkHealth() {
        HealthResponse response = new HealthResponse();
        response.setSuccess(true);
        response.setMessage("FeatureForge Backend is running.");
        response.setTimestamp(LocalDateTime.now());

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
