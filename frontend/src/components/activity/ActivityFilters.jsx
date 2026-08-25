import React, { useRef } from 'react';
import { FiFilter, FiCalendar, FiX } from 'react-icons/fi';

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

export default function ActivityFilters({
  activityTypeFilter,
  setActivityTypeFilter,
  userIdFilter,
  setUserIdFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  members,
  hasActiveFilters,
  handleClearFilters
}) {
  return (
    <div className="audit-filters-bar">
      <div className="audit-filter-label">
        <FiFilter size={14} className="audit-filter-icon" /> Filter Trail:
      </div>

      {/* Activity Type Filter */}
      <select
        value={activityTypeFilter}
        onChange={(e) => {
          setActivityTypeFilter(e.target.value);
        }}
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
        onChange={(e) => {
          setUserIdFilter(e.target.value);
        }}
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
        onChange={(e) => {
          setFromDate(e.target.value);
        }}
      />

      {/* Date Range: To */}
      <CustomDateInput
        label="To"
        value={toDate}
        onChange={(e) => {
          setToDate(e.target.value);
        }}
      />

      {/* Clear Filters CTA */}
      {hasActiveFilters && (
        <button onClick={handleClearFilters} className="audit-clear-btn" type="button">
          <FiX size={14} /> Clear Filters
        </button>
      )}
    </div>
  );
}
