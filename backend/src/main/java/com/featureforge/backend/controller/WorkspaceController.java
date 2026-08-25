package com.featureforge.backend.controller;

import com.featureforge.backend.dto.request.*;
import com.featureforge.backend.dto.response.*;
import com.featureforge.backend.enums.*;
import com.featureforge.backend.service.ActivityLogService;
import com.featureforge.backend.service.FeatureService;
import com.featureforge.backend.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/workspace")
public class WorkspaceController {

    private WorkspaceService workspaceService;
    private FeatureService featureService;
    private ActivityLogService activityLogService;

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
            @RequestParam(required = false) FeatureStatus status,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam EnvironmentName environment
    ) {

        return ResponseEntity.status(HttpStatus.OK).body(
                featureService.getAllFeaturesOfWorkspace(
                        page,
                        size,
                        status,
                        workspaceId,
                        keyword,
                        environment
                )
        );
    }

    @GetMapping("/{workspaceId}/features/{featureId}")
    public ResponseEntity<FeatureDetailsApiResponse> getFeatureDetails(
            @PathVariable(name = "workspaceId") UUID workspaceId,
            @PathVariable(name = "featureId") int featureId
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(featureService.fetchFeatureDetails(workspaceId, featureId));
    }

    @DeleteMapping("/{workspaceId}/members/{memberId}")
    public ResponseEntity<WorkspaceMemberDeletionResponse> removeMember(
            @PathVariable(name = "workspaceId") UUID workspaceId,
            @PathVariable(name = "memberId") int memberId) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(workspaceService.removeMemberForWorkspace(workspaceId, memberId));
    }

    @PatchMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceUpdationResponse> rename(
            @PathVariable(name = "workspaceId") UUID workspaceId,
            @RequestBody WorkspaceUpdationRequest workspaceUpdationRequest
            ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(workspaceService.renameWorkspace(workspaceId, workspaceUpdationRequest));
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceDeletionResponse> delete(
            @PathVariable(name = "workspaceId") UUID workspaceId
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(workspaceService.deleteWorkspace(workspaceId));
    }


    @DeleteMapping("/{workspaceId}/members/me")
    public ResponseEntity<WorkspaceMemberDeletionResponse> leave(
            @PathVariable(name = "workspaceId") UUID workspaceId) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(workspaceService.leaveWorkspace(workspaceId));
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<WorkspaceMemberResponse> getMembers(
            @PathVariable(name = "workspaceId") UUID workspaceId,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(workspaceService.getMembersOfWorkspace(workspaceId, role, keyword));
    }

    @GetMapping("/{workspaceId}/invitations")
    public ResponseEntity<WorkspaceInvitationResponse> getWorkspaceInvitations(
            @PathVariable(name = "workspaceId") UUID workspaceId,
            @RequestParam(required = false, defaultValue = "PENDING") InvitationStatus status
            ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(workspaceService.getInvitationsForWorkspace(workspaceId, status));
    }

    @DeleteMapping("/{workspaceId}/invitations/{id}")
    public ResponseEntity<RevokeInvitationResponse> revokeInvitation(
            @PathVariable(name = "workspaceId") UUID workspaceId,
            @PathVariable(name = "id") int id
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(workspaceService.revokeInvitationForWorkspace(workspaceId, id));
    }

    @PostMapping("/{workspaceId}/regenerate-api-key")
    public ResponseEntity<RegenerateApiKeyResponse> regenerateApiKeys(
            @PathVariable(name = "workspaceId") UUID workspaceId,
            @RequestBody RegenerateApiKeyRequest regenerateApiKeyRequest
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(workspaceService.regenerateApiKeysForWorkspace(workspaceId, regenerateApiKeyRequest));
    }

    @GetMapping()
    public ResponseEntity<UserWorkspaceResponse> getMyWorkspaces() {
        return ResponseEntity.status(HttpStatus.OK)
                .body(workspaceService.getUserWorkspaces());
    }

    @GetMapping("/{workspaceId}/activities")
    public ResponseEntity<ActivityLogPageResponse> getWorkspaceActivities(
            @PathVariable(name = "workspaceId") UUID workspaceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ActivityType activityType,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(activityLogService.getWorkspaceActivities(workspaceId, page, size, activityType, userId, from, to));
    }

    @GetMapping("/{workspaceId}/dashboard/feature-overview")
    public ResponseEntity<FeatureOverviewResponse> featureOverview(
            @PathVariable(name = "workspaceId") UUID workspaceId
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(workspaceService.getFeatureOverview(workspaceId));
    }

}
