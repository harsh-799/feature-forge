package com.featureforge.backend.controller;

import com.featureforge.backend.dto.request.FeatureEvaluationRequest;
import com.featureforge.backend.dto.response.FeatureEvaluationResponse;
import com.featureforge.backend.service.FeatureEvaluationService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class FeatureEvaluationController {

    private final FeatureEvaluationService featureEvaluationService;

    @GetMapping("/api/v1/evaluate")
    public ResponseEntity<FeatureEvaluationResponse> evaluate(
            @Valid @RequestBody FeatureEvaluationRequest featureEvaluationRequest,
            @RequestHeader("X-API-Key") String apiKey) {
        return ResponseEntity.status(HttpStatus.OK).body(featureEvaluationService.evaluateFeature(featureEvaluationRequest, apiKey));
    }
}
