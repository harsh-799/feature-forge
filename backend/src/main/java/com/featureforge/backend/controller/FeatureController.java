package com.featureforge.backend.controller;

import com.featureforge.backend.dto.request.FeatureCreationRequest;
import com.featureforge.backend.dto.request.FeatureQAVerificationRequest;
import com.featureforge.backend.dto.request.PromoteToStagingRequest;
import com.featureforge.backend.dto.response.FeatureCreationResponse;
import com.featureforge.backend.dto.response.FeatureQAVerificationResponse;
import com.featureforge.backend.dto.response.PromoteToStagingResponse;
import com.featureforge.backend.service.FeatureService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/features")
public class FeatureController {

    private final FeatureService featureService;

    @PostMapping("/create")
    public ResponseEntity<FeatureCreationResponse> create(@Valid @RequestBody FeatureCreationRequest featureCreationRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(featureService.createFeature(featureCreationRequest));
    }

    @PatchMapping("/{featureId}/promote")
    public ResponseEntity<PromoteToStagingResponse> promote(@PathVariable(name = "featureId") int featureId,
                                                            @Valid @RequestBody PromoteToStagingRequest promoteToStagingRequest
    ) {
        return ResponseEntity.status(HttpStatus.OK).body(featureService.promoteToStaging(featureId, promoteToStagingRequest));
    }

    @PatchMapping("/{featureId}/accept")
    public ResponseEntity<FeatureQAVerificationResponse> verify(@PathVariable(name = "featureId") int featureId,
                                                                @Valid @RequestBody FeatureQAVerificationRequest featureQAVerificationRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(featureService.verifyFeatureByQA(featureId, featureQAVerificationRequest));
    }

}
