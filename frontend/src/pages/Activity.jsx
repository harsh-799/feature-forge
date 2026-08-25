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

  FEATURE_CREATED: { title: 'Created Feature Flag', icon: FiToggleLeft },
  FEATURE_UPDATED: { title: 'Updated Feature Flag', icon: FiEdit3 },
  FEATURE_DELETED: { title: 'Deleted Feature Flag', icon: FiTrash2 },

  FEATURE_PROMOTED_TO_STAGING: { title: 'Promoted Feature to Staging', icon: FiLayers },
  FEATURE_QA_ACCEPTED: { title: 'Feature QA Accepted', icon: FiUserCheck },
  FEATURE_QA_REJECTED: { title: 'Feature QA Rejected', icon: FiXCircle },
  FEATURE_APPROVED_FOR_PRODUCTION: { title: 'Approved Feature for Production', icon: FiCheckCircle },

  FEATURE_ACTIVATED_IN_DEVELOPMENT: { title: 'Activated Feature (Development)', icon: FiToggleRight },
  FEATURE_DEACTIVATED_IN_DEVELOPMENT: { title: 'Deactivated Feature (Development)', icon: FiToggleLeft },
  FEATURE_ACTIVATED_IN_STAGING: { title: 'Activated Feature (Staging)', icon: FiToggleRight },
  FEATURE_DEACTIVATED_IN_STAGING: { title: 'Deactivated Feature (Staging)', icon: FiToggleLeft },
  FEATURE_ACTIVATED_IN_PRODUCTION: { title: 'Activated Feature (Production)', icon: FiToggleRight },
  FEATURE_DEACTIVATED_IN_PRODUCTION: { title: 'Deactivated Feature (Production)', icon: FiToggleLeft },

  FEATURE_ROLLOUT_UPDATED: { title: 'Updated Rollout Target', icon: FiSliders },
  FEATURE_SCHEDULED: { title: 'Scheduled Feature Flag', icon: FiClock },

  API_KEY_REGENERATED: { title: 'Regenerated API Key', icon: FiKey }
};

const ACTIVITY_TYPE_OPTIONS = [
  { value: '', label: 'All Activity Types' },
  {
    label: 'Workspace',
    options: [
      { value: 'WORKSPACE_CREATED', label: 'Workspace Created' },
      { value: 'WORKSPACE_RENAMED', label: 'Workspace Renamed' },
      { value: 'WORKSPACE_DELETED', label: 'Workspace Deleted' }
    ]
  },
  {
    label: 'Feature Flags',
    options: [
      { value: 'FEATURE_CREATED', label: 'Feature Created' },
      { value: 'FEATURE_UPDATED', label: 'Feature Updated' },
      { value: 'FEATURE_DELETED', label: 'Feature Deleted' },
      { value: 'FEATURE_ROLLOUT_UPDATED', label: 'Rollout Target Updated' },
      { value: 'FEATURE_PROMOTED_TO_STAGING', label: 'Promoted to Staging' },
      { value: 'FEATURE_QA_ACCEPTED', label: 'QA Accepted' },
      { value: 'FEATURE_QA_REJECTED', label: 'QA Rejected' },
      { value: 'FEATURE_APPROVED_FOR_PRODUCTION', label: 'Approved for Production' },
      { value: 'FEATURE_ACTIVATED_IN_DEVELOPMENT', label: 'Activated (Dev)' },
      { value: 'FEATURE_DEACTIVATED_IN_DEVELOPMENT', label: 'Deactivated (Dev)' },
      { value: 'FEATURE_ACTIVATED_IN_STAGING', label: 'Activated (Staging)' },
      { value: 'FEATURE_DEACTIVATED_IN_STAGING', label: 'Deactivated (Staging)' },
      { value: 'FEATURE_ACTIVATED_IN_PRODUCTION', label: 'Activated (Prod)' },
      { value: 'FEATURE_DEACTIVATED_IN_PRODUCTION', label: 'Deactivated (Prod)' },
      { value: 'FEATURE_SCHEDULED', label: 'Feature Scheduled' }
    ]
  },
  {
    label: 'Team & Members',
    options: [
      { value: 'MEMBER_INVITED', label: 'Member Invited' },
      { value: 'INVITATION_ACCEPTED', label: 'Member Joined' },
      { value: 'MEMBER_LEFT', label: 'Member Left' },
      { value: 'MEMBER_REMOVED', label: 'Member Removed' },
      { value: 'INVITATION_REVOKED', label: 'Invitation Revoked' }
    ]
  },
  {
    label: 'API Keys',
    options: [
      { value: 'API_KEY_REGENERATED', label: 'API Key Regenerated' }
    ]
  }
];

// Custom Date Filter Input Component
function CustomDateInput({ label, value, onChange }) {
  const inputRef = useRef(null);

  const formatDisplayDate = (val) => {
    if (!val) return 'Select date';
    const parts = val.split('-');
    if (parts.length !== 3) return 'Select date';
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  const handleWrapperClick = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        try {
          inputRef.current.showPicker();
        } catch (e) {
          inputRef.current.focus();
        }
      } else {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="audit-date-group">
      <span className="audit-date-label">{label}:</span>
      <div className="custom-date-picker-wrapper" onClick={handleWrapperClick}>
        <FiCalendar size={13} className="custom-date-icon" />
        <span className={`custom-date-display ${!value ? 'placeholder' : ''}`}>
          {formatDisplayDate(value)}
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

  // Filter States
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination States
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLast, setIsLast] = useState(true);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Workspace Members for User Filter dropdown
  useEffect(() => {
    if (!currentWorkspaceId) return;
    const fetchMembers = async () => {
      try {
        const response = await getWorkspaceMembers(currentWorkspaceId);
        if (response && response.success) {
          setMembers(response.membersData || []);
        }
      } catch (err) {
        // silent catch
      }
    };
    fetchMembers();
  }, [currentWorkspaceId]);

  // Fetch Activities Effect
  useEffect(() => {
    if (!currentWorkspaceId) return;

    const fetchActivities = async () => {
      setIsLoading(true);
      const startTime = Date.now();
      try {
        const params = {
          page,
          size: pageSize,
          activityType: activityTypeFilter || null,
          userId: userIdFilter ? parseInt(userIdFilter, 10) : null,
          from: fromDate ? `${fromDate}T00:00:00` : null,
          to: toDate ? `${toDate}T23:59:59` : null
        };

        const response = await getWorkspaceActivities(currentWorkspaceId, params);

        // Prevent loader flicker by enforcing minimum 300ms duration
        const elapsed = Date.now() - startTime;
        if (elapsed < 300) {
          await new Promise(res => setTimeout(res, 300 - elapsed));
        }

        if (response && response.success) {
          const content = response.activities || [];
          setActivities(content);
          setIsLast(response.isLast ?? true);
          setTotalPages(Math.ceil((response.totalElements || 0) / pageSize) || 1);
        } else {
          toast.error(response?.message || 'Failed to fetch activity logs.');
        }
      } catch (err) {
        const msg = getErrorMessage(err);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [currentWorkspaceId, page, pageSize, activityTypeFilter, userIdFilter, fromDate, toDate]);

  // Helper date and time formatters
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDateGroup = (isoString) => {
    if (!isoString) return 'Earlier';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Earlier';

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';

    const day = date.getDate();
    const month = date.toLocaleDateString([], { month: 'short' });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  // Group activities into chronological sections
  const groupActivities = (items) => {
    const groupsMap = new Map();
    (items || []).forEach(item => {
      const label = formatDateGroup(item.createdAt);
      if (!groupsMap.has(label)) {
        groupsMap.set(label, []);
      }
      groupsMap.get(label).push(item);
    });

    const result = [];
    groupsMap.forEach((groupItems, label) => {
      result.push({ label, items: groupItems });
    });
    return result;
  };

  const handleClearFilters = () => {
    setActivityTypeFilter('');
    setUserIdFilter('');
    setFromDate('');
    setToDate('');
    setPage(0);
  };

  const hasActiveFilters = Boolean(activityTypeFilter || userIdFilter || fromDate || toDate);
  const activityGroups = groupActivities(activities);

  return (
    <div className="activity-page" style={{ fontFamily: 'var(--sans)', textAlign: 'left', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <style>{`
        .activity-page {
          box-sizing: border-box;
        }

        .activity-header {
          margin-bottom: 28px;
        }

        .activity-subtitle-tag {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .activity-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-heading);
          margin-top: 4px;
          letter-spacing: -0.02em;
        }

        .activity-description {
          font-size: 14px;
          color: var(--text-primary);
          margin-top: 6px;
          opacity: 0.8;
          line-height: 1.5;
        }

        /* Filters Bar */
        .audit-filters-bar {
          background-color: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 14px 18px;
          margin-bottom: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .audit-filter-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-heading);
          margin-right: 4px;
        }

        .audit-filter-select {
          padding: 8px 14px;
          border: 1px solid var(--border-color);
          border-radius: 30px;
          font-size: 13px;
          font-family: var(--sans);
          background-color: #FAF8F3;
          color: var(--text-heading);
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        .audit-filter-select:focus {
          border-color: var(--accent);
          background-color: #FFFFFF;
        }

        .audit-date-group {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--text-primary);
        }

        .audit-date-label {
          font-weight: 500;
          color: var(--text-primary);
        }

        .custom-date-picker-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border: 1px solid var(--border-color);
          border-radius: 30px;
          background-color: #FAF8F3;
          cursor: pointer;
          user-select: none;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        .custom-date-picker-wrapper:hover {
          border-color: var(--accent);
          background-color: #FFFFFF;
        }

        .custom-date-icon {
          color: var(--text-primary);
          opacity: 0.65;
          flex-shrink: 0;
        }

        .custom-date-display {
          font-size: 13px;
          font-family: var(--sans);
          color: var(--text-heading);
          font-weight: 500;
          letter-spacing: -0.01em;
        }

        .custom-date-display.placeholder {
          color: var(--text-primary);
          opacity: 0.6;
          font-weight: 400;
        }

        .hidden-native-date-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          border: none;
          margin: 0;
          padding: 0;
          z-index: 1;
        }

        .audit-clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 8px 14px;
          border-radius: 30px;
          border: 1px solid var(--border-color);
          background-color: transparent;
          color: var(--text-primary);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          margin-left: auto;
        }

        .audit-clear-btn:hover {
          background-color: #FAF8F3;
          color: var(--text-heading);
          border-color: rgba(38, 37, 33, 0.2);
        }

        /* Timeline Section */
        .timeline-section-group {
          margin-bottom: 36px;
          position: relative;
        }

        .timeline-date-header {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-heading);
          background-color: #FAF8F3;
          border: 1px solid var(--border-color);
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 20px;
        }

        .timeline-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          padding-left: 20px;
        }

        /* Continuous Vertical Timeline Line */
        .timeline-list::before {
          content: '';
          position: absolute;
          left: 17px;
          top: 8px;
          bottom: 12px;
          width: 2px;
          background-color: var(--border-color);
        }

        .timeline-item {
          display: flex;
          gap: 16px;
          position: relative;
          align-items: flex-start;
        }

        /* Event Node Circle */
        .timeline-marker-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #FFFFFF;
          border: 1.5px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          z-index: 2;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          color: var(--accent);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .timeline-item:hover .timeline-marker-circle {
          border-color: var(--accent);
          transform: scale(1.05);
        }

        /* Card Content Box */
        .timeline-content-card {
          flex: 1;
          background-color: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 16px 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .timeline-item:hover .timeline-content-card {
          border-color: rgba(38, 37, 33, 0.2);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.025);
        }

        .timeline-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 6px;
        }

        .timeline-card-title {
          font-weight: 700;
          font-size: 14px;
          color: var(--text-heading);
          letter-spacing: -0.01em;
        }

        .timeline-card-time {
          font-size: 12px;
          color: var(--text-primary);
          opacity: 0.65;
          font-weight: 500;
          white-space: nowrap;
        }

        .timeline-card-desc {
          font-size: 13px;
          color: var(--text-primary);
          line-height: 1.5;
          opacity: 0.85;
          margin-bottom: 10px;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .timeline-card-actor {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--text-primary);
          opacity: 0.75;
          font-weight: 500;
        }

        /* Empty State */
        .audit-empty-card {
          background-color: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 56px 24px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.01);
        }

        .audit-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background-color: #FAF8F3;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: var(--text-primary);
          opacity: 0.6;
        }

        .audit-empty-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-heading);
          margin-bottom: 6px;
        }

        .audit-empty-desc {
          font-size: 13.5px;
          color: var(--text-primary);
          opacity: 0.75;
          max-width: 400px;
          margin: 0 auto 16px;
        }

        /* Pagination Bar */
        .audit-pagination-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 36px;
          padding-top: 16px;
        }

        .audit-pagination-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 30px;
          border: 1px solid var(--border-color);
          background-color: #FFFFFF;
          color: var(--text-heading);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .audit-pagination-btn:hover:not(:disabled) {
          background-color: #FAF8F3;
          border-color: rgba(38, 37, 33, 0.25);
        }

        .audit-pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .audit-pagination-info {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        /* Skeleton Pulse Loader */
        .skeleton-timeline-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .skeleton-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #E6E4DD;
          flex-shrink: 0;
        }
        .skeleton-card {
          flex: 1;
          height: 84px;
          border-radius: 14px;
          background-color: #E6E4DD;
        }
        .pulse {
          animation: pulseAnim 1.4s ease-in-out infinite;
        }
        @keyframes pulseAnim {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }

        /* Responsive Breakpoints */
        @media (max-width: 640px) {
          .audit-filters-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            padding: 12px 14px;
          }
          .audit-filter-select,
          .audit-date-group,
          .custom-date-picker-wrapper {
            width: 100%;
          }
          .audit-date-group {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          .audit-clear-btn {
            width: 100%;
            justify-content: center;
            margin-left: 0;
          }
          .timeline-list {
            padding-left: 12px;
          }
          .timeline-list::before {
            left: 13px;
          }
          .timeline-marker-circle {
            width: 28px;
            height: 28px;
          }
          .timeline-marker-circle svg {
            width: 12px;
            height: 12px;
          }
          .timeline-content-card {
            padding: 12px 14px;
          }
        }
      `}</style>

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
          <FiFilter size={14} style={{ color: 'var(--accent)' }} /> Filter Trail:
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '20px' }}>
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
            <button onClick={handleClearFilters} className="audit-clear-btn" style={{ margin: '0 auto', display: 'inline-flex' }}>
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
                <FiCalendar size={12} style={{ color: 'var(--accent)' }} />
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
                          <FiUser size={12} style={{ opacity: 0.7 }} />
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
