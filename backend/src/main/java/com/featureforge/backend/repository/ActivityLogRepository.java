package com.featureforge.backend.repository;

import com.featureforge.backend.entity.ActivityLog;
import com.featureforge.backend.entity.Workspace;
import com.featureforge.backend.enums.ActivityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    @Query("""
        SELECT al
        FROM ActivityLog al
        WHERE al.workspace.id = :workspaceId
        AND al.activityType = COALESCE(:activityType, al.activityType)
        AND al.performedBy.id = COALESCE(:userId, al.performedBy.id)
        AND al.createdAt >= COALESCE(:fromDate, al.createdAt)
        AND al.createdAt <= COALESCE(:toDate, al.createdAt)
        """)
    Page<ActivityLog> findActivities(
            @Param("workspaceId") UUID workspaceId,
            @Param("activityType") ActivityType activityType,
            @Param("userId") Integer userId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );

    void deleteByWorkspace(Workspace workspace);
}
