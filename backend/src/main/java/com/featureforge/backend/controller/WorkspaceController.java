package com.featureforge.backend.controller;

import com.featureforge.backend.dto.request.*;
import com.featureforge.backend.dto.response.*;
import com.featureforge.backend.enums.FeatureStatus;
import com.featureforge.backend.enums.InvitationStatus;
import com.featureforge.backend.enums.Role;
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
                        status,
                        workspaceId
                )
        );
    }

    @GetMapping("/{workspaceId}/features/search")
    public ResponseEntity<FeaturesPageResponse> getFeaturesByKeyword(
            @PathVariable(name = "workspaceId") UUID workspaceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(required = false) FeatureStatus status,
            @RequestParam(defaultValue = "") String keyword
    ) {

        return ResponseEntity.status(HttpStatus.OK).body(
                featureService.getAllFeaturesOfWorkspaceByKeyword(
                        page,
                        size,
                        status,
                        workspaceId,
                        keyword
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

}
