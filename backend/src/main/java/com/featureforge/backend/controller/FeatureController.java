package com.featureforge.backend.controller;

import com.featureforge.backend.dto.request.FeatureCreationRequest;
import com.featureforge.backend.dto.response.FeatureCreationResponse;
import com.featureforge.backend.service.FeatureService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/features")
public class FeatureController {

    private final FeatureService featureService;

    @PostMapping("/create")
    public ResponseEntity<FeatureCreationResponse> create(@Valid @RequestBody FeatureCreationRequest featureCreationRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(featureService.createFeature(featureCreationRequest));
    }
}
