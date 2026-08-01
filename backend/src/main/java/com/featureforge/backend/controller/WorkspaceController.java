package com.featureforge.backend.controller;

import com.featureforge.backend.dto.request.AcceptMemberRequest;
import com.featureforge.backend.dto.request.InviteMemberRequest;
import com.featureforge.backend.dto.request.WorkspaceCreationRequest;
import com.featureforge.backend.dto.response.AcceptMemberResponse;
import com.featureforge.backend.dto.response.FeaturesPageResponse;
import com.featureforge.backend.dto.response.InviteMemberResponse;
import com.featureforge.backend.dto.response.WorkspaceCreationResponse;
import com.featureforge.backend.enums.FeatureStatus;
import com.featureforge.backend.service.FeatureService;
import com.featureforge.backend.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/workspace")
public class WorkspaceController {

    private WorkspaceService workspaceService;
    private FeatureService featureService;

    @PostMapping("/create")
    public ResponseEntity<WorkspaceCreationResponse> create(@Valid @RequestBody WorkspaceCreationRequest workspaceCreationRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workspaceService.createWorkspace(workspaceCreationRequest));
    }

    @PostMapping("/invite")
    public ResponseEntity<InviteMemberResponse> invite(@Valid @RequestBody InviteMemberRequest inviteMemberRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(workspaceService.inviteMemberToWorkspace(inviteMemberRequest));
    }

    @PostMapping("/accept")
    public ResponseEntity<AcceptMemberResponse> accept(@Valid @RequestBody AcceptMemberRequest acceptMemberRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(workspaceService.acceptMemberForWorkspace(acceptMemberRequest));
    }

    @GetMapping("/{workspaceId}/features")
    public ResponseEntity<FeaturesPageResponse> getFeatures(
            @PathVariable(name = "workspaceId") UUID workspaceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(required = false) FeatureStatus status
            ) {

        return ResponseEntity.status(HttpStatus.OK).body(
                featureService.getAllFeaturesOfWorkspace(
                        page,
                        size,
                        status,workspaceId
                )
        );
    }
}
