package com.featureforge.backend.service;

import com.featureforge.backend.entity.ActivityLog;
import com.featureforge.backend.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityLogger {

    private final ActivityLogRepository activityLogRepository;

    public void logActivity(UUID workspaceId, String action, String context, String actor) {
        try {
            ActivityLog log = ActivityLog.builder()
                    .workspaceId(workspaceId)
                    .action(action)
                    .context(context)
                    .actor(actor)
                    .build();
            activityLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Failed to log activity: " + e.getMessage());
        }
    }
}
