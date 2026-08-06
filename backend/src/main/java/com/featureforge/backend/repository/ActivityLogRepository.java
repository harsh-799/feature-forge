package com.featureforge.backend.repository;

import com.featureforge.backend.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findFirst5ByWorkspaceIdOrderByTimestampDesc(UUID workspaceId);

    Page<ActivityLog> findByWorkspaceIdOrderByTimestampDesc(UUID workspaceId, Pageable pageable);
}
