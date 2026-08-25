import React from 'react';
import {
  FiClock, FiUser, FiFolder, FiUserPlus, FiUserMinus, FiUserCheck,
  FiEdit3, FiTrash2, FiSliders, FiKey, FiCheckCircle, FiXCircle,
  FiToggleLeft, FiChevronRight, FiCalendar, FiX
} from 'react-icons/fi';

const ACTIVITY_META = {
  WORKSPACE_CREATED: { title: 'Created Workspace', icon: FiFolder },
  WORKSPACE_RENAMED: { title: 'Renamed Workspace', icon: FiEdit3 },
  WORKSPACE_DELETED: { title: 'Deleted Workspace', icon: FiTrash2 },

  MEMBER_INVITED: { title: 'Invited Member', icon: FiUserPlus },
  MEMBER_REMOVED: { title: 'Removed Member', icon: FiUserMinus },
  MEMBER_LEFT: { title: 'Member Left Workspace', icon: FiUserMinus },

  INVITATION_ACCEPTED: { title: 'Member Joined Workspace', icon: FiUserCheck },
  INVITATION_REVOKED: { title: 'Revoked Invitation', icon: FiUserMinus },

  ENVIRONMENT_KEY_REGENERATED: { title: 'Regenerated Environment Key', icon: FiKey },

  FEATURE_FLAG_CREATED: { title: 'Created Feature Flag', icon: FiToggleLeft },
  FEATURE_FLAG_UPDATED: { title: 'Updated Feature Flag', icon: FiEdit3 },
  FEATURE_FLAG_DELETED: { title: 'Deleted Feature Flag', icon: FiTrash2 },
  FEATURE_FLAG_ENABLED: { title: 'Enabled Feature Flag', icon: FiCheckCircle },
  FEATURE_FLAG_DISABLED: { title: 'Disabled Feature Flag', icon: FiXCircle },

  ROLLOUT_PERCENTAGE_UPDATED: { title: 'Updated Rollout Percentage', icon: FiSliders },

  STAGE_PROMOTED: { title: 'Promoted Flag Stage', icon: FiChevronRight },
  STAGE_REJECTED: { title: 'Rejected Flag Stage', icon: FiXCircle }
};

export default function ActivityTimeline({
  activityGroups,
  activities,
  isLoading,
  hasActiveFilters,
  handleClearFilters
}) {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="skeleton-timeline-container">
        {[1, 2, 3].map(n => (
          <div key={n} className="skeleton-timeline-item">
            <div className="skeleton-circle pulse" />
            <div className="skeleton-card pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="audit-empty-card">
        <div className="audit-empty-icon">
          <FiClock size={24} />
        </div>
        <h3 className="audit-empty-title">No activity yet</h3>
        <p className="audit-empty-desc">
          {hasActiveFilters
            ? 'No activity logs match your selected filters.'
            : 'Workspace changes and events will appear here.'}
        </p>
        {hasActiveFilters && (
          <button onClick={handleClearFilters} className="audit-clear-btn audit-clear-btn-centered" type="button">
            <FiX size={14} /> Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Chronological Timeline Render */}
      {activityGroups.map((group, groupIdx) => (
        <div key={groupIdx} className="timeline-section-group">
          {/* Natural Date Group Label (TODAY, YESTERDAY, 25 Aug 2026, etc.) */}
          <div className="timeline-date-header">
            <FiCalendar size={12} className="timeline-date-icon" />
            <span>{group.label}</span>
          </div>

          {/* Vertical Timeline Items List */}
          <div className="timeline-list">
            {group.items.map((log) => {
              const meta = ACTIVITY_META[log.activityType] || {
                title: log.activityType ? log.activityType.replace(/_/g, ' ') : 'Workspace Activity',
                icon: FiClock
              };
              const IconComponent = meta.icon;
              const timeFormatted = formatTime(log.createdAt);

              return (
                <div key={log.id} className="timeline-item">
                  {/* Left Event Marker Circle */}
                  <div className="timeline-marker-circle">
                    <IconComponent size={15} />
                  </div>

                  {/* Right Event Details Card */}
                  <div className="timeline-content-card">
                    <div className="timeline-card-top">
                      <span className="timeline-card-title">{meta.title}</span>
                      {timeFormatted && (
                        <span className="timeline-card-time">{timeFormatted}</span>
                      )}
                    </div>

                    {log.description && (
                      <div className="timeline-card-desc">{log.description}</div>
                    )}

                    <div className="timeline-card-actor">
                      <FiUser size={12} className="timeline-actor-icon" />
                      <span>{log.performedByName || 'Workspace Member'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
