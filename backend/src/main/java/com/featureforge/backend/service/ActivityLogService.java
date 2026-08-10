package com.featureforge.backend.service;

import com.featureforge.backend.dto.response.ActivityLogPageResponse;
import com.featureforge.backend.dto.response.ActivityLogResponse;
import com.featureforge.backend.entity.ActivityLog;
import com.featureforge.backend.entity.Workspace;
import com.featureforge.backend.entity.WorkspaceMembership;
import com.featureforge.backend.entity.User;
import com.featureforge.backend.enums.ActivityType;
import com.featureforge.backend.exception.AccessDeniedException;
import com.featureforge.backend.repository.ActivityLogRepository;
import com.featureforge.backend.repository.WorkspaceMembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final WorkspaceMembershipRepository workspaceMembershipRepository;

    private User fetchAuthenticatedUser() {
        CustomUserDetails customUserDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        return customUserDetails.getUser();
    }

    public void log(Workspace workspace, User performedBy, ActivityType activityType, String description) {
        ActivityLog activityLog = ActivityLog.builder()
                .workspace(workspace)
                .performedBy(performedBy)
                .activityType(activityType)
                .description(description)
                .build();

        activityLogRepository.save(activityLog);
    }

    @Transactional(readOnly = true)
    public ActivityLogPageResponse getWorkspaceActivities(
            UUID workspaceId,
            int page,
            int size,
            ActivityType activityType,
            Integer userId,
            LocalDateTime from,
            LocalDateTime to
    ) {
        User loggedInUser = fetchAuthenticatedUser();

        // Verify membership
        workspaceMembershipRepository.findByWorkspace_IdAndUser(workspaceId, loggedInUser)
                .orElseThrow(() -> new AccessDeniedException("You don't have access to this workspace."));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<ActivityLog> activityPage = activityLogRepository.findActivities(
                workspaceId,
                activityType,
                userId,
                from,
                to,
                pageable
        );

        List<ActivityLogResponse> activitiesList = activityPage.getContent().stream()
                .map(al -> ActivityLogResponse.builder()
                        .id(al.getId())
                        .activityType(al.getActivityType())
                        .description(al.getDescription())
                        .performedById(al.getPerformedBy() != null ? al.getPerformedBy().getId() : null)
                        .performedByName(al.getPerformedBy() != null ? al.getPerformedBy().getFullname() : null)
                        .createdAt(al.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ActivityLogPageResponse.builder()
                .success(true)
                .message("Workspace activities fetched successfully")
                .page(activityPage.getNumber())
                .size(activityPage.getSize())
                .totalElements(activityPage.getTotalElements())
                .isLast(activityPage.isLast())
                .activities(activitiesList)
                .build();
    }
}
