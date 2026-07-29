package com.featureforge.backend.controller;

import com.featureforge.backend.dto.request.InviteMemberRequest;
import com.featureforge.backend.dto.request.WorkspaceCreationRequest;
import com.featureforge.backend.dto.response.InviteMemberResponse;
import com.featureforge.backend.dto.response.WorkspaceCreationResponse;
import com.featureforge.backend.service.WorkspaceService;
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
@RequestMapping("/workspace")
public class WorkspaceController {

    private WorkspaceService workspaceService;

    @PostMapping("/create")
    public ResponseEntity<WorkspaceCreationResponse> create(@Valid @RequestBody WorkspaceCreationRequest workspaceCreationRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workspaceService.createWorkspace(workspaceCreationRequest));
    }

    @PostMapping("/invite")
    public ResponseEntity<InviteMemberResponse> invite(@Valid @RequestBody InviteMemberRequest inviteMemberRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(workspaceService.inviteMemberToWorkspace(inviteMemberRequest));
    }
}
