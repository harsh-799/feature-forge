package com.featureforge.backend.controller;

import com.featureforge.backend.dto.request.*;
import com.featureforge.backend.dto.response.*;
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

    @PatchMapping("/{featureId}/reject")
    public ResponseEntity<FeatureQARejectionResponse> reject(@PathVariable(name = "featureId") int featureId,
                                                             @Valid @RequestBody FeatureQARejectionRequest featureQARejectionRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(featureService.rejectFeatureByQA(featureId, featureQARejectionRequest));
    }

    @PatchMapping("/{featureId}/re-promote")
    public ResponseEntity<PromoteToStagingResponse> repromote(@PathVariable(name = "featureId") int featureId,
                                                            @Valid @RequestBody PromoteToStagingRequest promoteToStagingRequest
    ) {
        return ResponseEntity.status(HttpStatus.OK).body(featureService.promoteToStaging(featureId, promoteToStagingRequest));
    }

    @PatchMapping("/{featureId}/approve")
    public ResponseEntity<FeatureProductionApprovalResponse> approve(@PathVariable(name = "featureId") int featureId,
                                                                     @Valid @RequestBody FeatureProductionApprovalRequest featureProductionApprovalRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(featureService.approveFeatureToProduction(featureId, featureProductionApprovalRequest));
    }

    @PatchMapping("/{featureId}/production/activate")
    public ResponseEntity<FeatureProductionActivationResponse> activate(@PathVariable(name = "featureId") int featureId,
                                                                     @Valid @RequestBody FeatureProductionActivationRequest featureProductionActivationRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(featureService.activateFeatureInProduction(featureId, featureProductionActivationRequest));
    }

    @PatchMapping("/{featureId}/production/rollout")
    public ResponseEntity<FeatureProductionRolloutResponse> updateRollout(@PathVariable(name = "featureId") int featureId,
                                                                        @Valid @RequestBody FeatureProductionRolloutRequest featureProductionRolloutRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(featureService.updateRolloutInProduction(featureId, featureProductionRolloutRequest));
    }

    @PatchMapping("/{featureId}/production/deactivate")
    public ResponseEntity<FeatureDeactivationResponse> deactivateInProduction(@PathVariable(name = "featureId") int featureId,
                                                                        @Valid @RequestBody FeatureDeactivationRequest featureDeactivationRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(featureService.deactivateFeatureInProduction(featureId, featureDeactivationRequest));
    }

    @PatchMapping("/{featureId}/production/schedule")
    public ResponseEntity<FeatureProductionScheduleResponse> schedule(@PathVariable(name = "featureId") int featureId,
                                                                      @Valid @RequestBody FeatureProductionScheduleRequest featureProductionScheduleRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(featureService.scheduleFeatureInProduction(featureId, featureProductionScheduleRequest));
    }

    @PatchMapping("/{featureId}/edit")
    public ResponseEntity<FeatureUpdationResponse> update(@PathVariable(name = "featureId") int featureId,
                                                          @Valid @RequestBody FeatureUpdationRequest featureUpdationRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(featureService.updateFeature(featureId, featureUpdationRequest));
    }

    @DeleteMapping("/{featureId}")
    public ResponseEntity<FeatureDeletionResponse> delete(@PathVariable(name = "featureId") int featureId,
                                                          @Valid @RequestBody FeatureDeletionRequest featureDeletionRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(featureService.deleteFeature(featureId, featureDeletionRequest));
    }

    @PatchMapping("/{featureId}/development/deactivate")
    public ResponseEntity<FeatureDeactivationResponse> deactivateInDevelopment(@PathVariable(name = "featureId") int featureId,
                                                                            @Valid @RequestBody FeatureDeactivationRequest featureDeactivationRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(featureService.deactivateFeatureInDevelopment(featureId, featureDeactivationRequest));
    }

    @PatchMapping("/{featureId}/development/activate")
    public ResponseEntity<FeatureActivationResponse> activateInDevelopment(@PathVariable(name = "featureId") int featureId,
                                                                               @Valid @RequestBody FeatureActivationRequest featureActivationRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(featureService.activateFeatureInDevelopment(featureId, featureActivationRequest));
    }

}
