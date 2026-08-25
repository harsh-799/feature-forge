import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  FiClock,
  FiUser,
  FiFolder,
  FiUserPlus,
  FiUserMinus,
  FiUserCheck,
  FiEdit3,
  FiTrash2,
  FiLayers,
  FiSliders,
  FiKey,
  FiCheckCircle,
  FiXCircle,
  FiToggleLeft,
  FiToggleRight,
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar
} from 'react-icons/fi'
import { getWorkspaceActivities, getWorkspaceMembers } from '../api/workspaceApi'
import { getErrorMessage } from '../api/authApi'
import { toast } from 'react-toastify'
import './Activity.css'

// Map ActivityType backend enum to human-readable title and icon
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

// Activity categories for filter dropdown
const ACTIVITY_TYPE_OPTIONS = [
  { value: '', label: 'All Activities' },
  {
    label: 'Workspace',
    options: [
      { value: 'WORKSPACE_CREATED', label: 'Workspace Created' },
      { value: 'WORKSPACE_RENAMED', label: 'Workspace Renamed' },
      { value: 'WORKSPACE_DELETED', label: 'Workspace Deleted' }
    ]
  },
  {
    label: 'Members & Invites',
    options: [
      { value: 'MEMBER_INVITED', label: 'Member Invited' },
      { value: 'MEMBER_REMOVED', label: 'Member Removed' },
      { value: 'MEMBER_LEFT', label: 'Member Left' },
      { value: 'INVITATION_ACCEPTED', label: 'Invitation Accepted' },
      { value: 'INVITATION_REVOKED', label: 'Invitation Revoked' }
    ]
  },
  {
    label: 'Feature Flags',
    options: [
      { value: 'FEATURE_FLAG_CREATED', label: 'Flag Created' },
      { value: 'FEATURE_FLAG_UPDATED', label: 'Flag Updated' },
      { value: 'FEATURE_FLAG_DELETED', label: 'Flag Deleted' },
      { value: 'FEATURE_FLAG_ENABLED', label: 'Flag Enabled' },
      { value: 'FEATURE_FLAG_DISABLED', label: 'Flag Disabled' },
      { value: 'ROLLOUT_PERCENTAGE_UPDATED', label: 'Rollout Updated' },
      { value: 'STAGE_PROMOTED', label: 'Stage Promoted' },
      { value: 'STAGE_REJECTED', label: 'Stage Rejected' }
    ]
  },
  {
    label: 'Environments',
    options: [
      { value: 'ENVIRONMENT_KEY_REGENERATED', label: 'Key Regenerated' }
    ]
  }
];

// Helper: Custom Date Input Component
function CustomDateInput({ label, value, onChange }) {
  const inputRef = useRef(null);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[parseInt(m, 10) - 1] || m;
    return `${d} ${monthName} ${y}`;
  };

  return (
    <div className="audit-date-group">
      <span className="audit-date-label">{label}:</span>
      <div 
        className="custom-date-picker-wrapper"
        onClick={() => {
          if (inputRef.current) {
            if (typeof inputRef.current.showPicker === 'function') {
              inputRef.current.showPicker();
            } else {
              inputRef.current.focus();
            }
          }
        }}
      >
        <FiCalendar size={14} className="custom-date-icon" />
        <span className={`custom-date-display ${!value ? 'placeholder' : ''}`}>
          {value ? formatDateDisplay(value) : 'Select date'}
        </span>
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={onChange}
          className="hidden-native-date-input"
        />
      </div>
    </div>
  );
}

export default function Activity() {
  const { currentWorkspaceId } = useOutletContext();
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLast, setIsLast] = useState(true);

  // Load workspace members for the filter dropdown
  useEffect(() => {
    if (!currentWorkspaceId) return;

    let isMounted = true;
    getWorkspaceMembers(currentWorkspaceId)
      .then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : (data?.members || []);
          setMembers(list);
        }
      })
      .catch((err) => {
        console.error('Failed to load workspace members for filter:', err);
      });

    return () => { isMounted = false; };
  }, [currentWorkspaceId]);

  // Load activity audit logs
  useEffect(() => {
    if (!currentWorkspaceId) return;

    let isMounted = true;
    setIsLoading(true);

    const params = {
      page,
      size: 15
    };

    if (activityTypeFilter) params.activityType = activityTypeFilter;
    if (userIdFilter) params.userId = userIdFilter;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    getWorkspaceActivities(currentWorkspaceId, params)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.content) {
          setActivities(res.content);
          setTotalPages(res.totalPages || 0);
          setIsLast(res.last !== undefined ? res.last : true);
        } else if (Array.isArray(res)) {
          setActivities(res);
          setTotalPages(1);
          setIsLast(true);
        } else {
          setActivities([]);
          setTotalPages(0);
          setIsLast(true);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = getErrorMessage(err);
        toast.error(`Failed to load activities: ${msg}`);
        setActivities([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [currentWorkspaceId, page, activityTypeFilter, userIdFilter, fromDate, toDate]);

  const handleClearFilters = () => {
    setActivityTypeFilter('');
    setUserIdFilter('');
    setFromDate('');
    setToDate('');
    setPage(0);
  };

  // Helper to format ISO timestamp into time string (e.g. 10:45 AM)
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Group activities chronologically by day
  const groupActivities = (items) => {
    const groups = {};

    items.forEach((item) => {
      if (!item.createdAt) {
        const key = 'Earlier';
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
        return;
      }

      const itemDate = new Date(item.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let groupKey = '';
      if (itemDate.toDateString() === today.toDateString()) {
        groupKey = 'TODAY';
      } else if (itemDate.toDateString() === yesterday.toDateString()) {
        groupKey = 'YESTERDAY';
      } else {
        groupKey = itemDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    return Object.keys(groups).map((key) => ({
      label: key,
      items: groups[key]
    }));
  };

  const hasActiveFilters = Boolean(activityTypeFilter || userIdFilter || fromDate || toDate);
  const activityGroups = groupActivities(activities);

  return (
    <div className="activity-page">
      {/* Page Header */}
      <div className="activity-header">
        <span className="activity-subtitle-tag">ACTIVITY LOGS</span>
        <h1 className="activity-title">Audit Trail</h1>
        <p className="activity-description">
          Workspace history, target revisions, status updates, and configuration changes.
        </p>
      </div>

      {/* Filter Toolbar (Backend Supported: Activity Type, User, Date Range) */}
      <div className="audit-filters-bar">
        <div className="audit-filter-label">
          <FiFilter size={14} className="audit-filter-icon" /> Filter Trail:
        </div>

        {/* Activity Type Filter */}
        <select
          value={activityTypeFilter}
          onChange={(e) => { setActivityTypeFilter(e.target.value); setPage(0); }}
          className="audit-filter-select"
        >
          {ACTIVITY_TYPE_OPTIONS.map((optGroup, idx) => {
            if (optGroup.options) {
              return (
                <optgroup label={optGroup.label} key={idx}>
                  {optGroup.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              );
            }
            return (
              <option key={optGroup.value} value={optGroup.value}>
                {optGroup.label}
              </option>
            );
          })}
        </select>

        {/* User Filter */}
        <select
          value={userIdFilter}
          onChange={(e) => { setUserIdFilter(e.target.value); setPage(0); }}
          className="audit-filter-select"
        >
          <option value="">All Users</option>
          {members.map(m => (
            <option key={m.userId || m.id} value={m.userId || m.id}>
              {m.name || m.email}
            </option>
          ))}
        </select>

        {/* Date Range: From */}
        <CustomDateInput
          label="From"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
        />

        {/* Date Range: To */}
        <CustomDateInput
          label="To"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(0); }}
        />

        {/* Clear Filters CTA */}
        {hasActiveFilters && (
          <button onClick={handleClearFilters} className="audit-clear-btn" type="button">
            <FiX size={14} /> Clear Filters
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="skeleton-timeline-container">
          {[1, 2, 3].map(n => (
            <div key={n} className="skeleton-timeline-item">
              <div className="skeleton-circle pulse" />
              <div className="skeleton-card pulse" />
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
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
      ) : (
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

          {/* Simple Pagination Bar */}
          {totalPages > 1 && (
            <div className="audit-pagination-bar">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="audit-pagination-btn"
              >
                <FiChevronLeft size={15} /> Previous
              </button>
              <span className="audit-pagination-info">
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => p + 1)}
                disabled={isLast || page >= totalPages - 1}
                className="audit-pagination-btn"
              >
                Next <FiChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
