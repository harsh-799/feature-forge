import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'
import { getWorkspaceActivities, getWorkspaceMembers } from '../api/workspaceApi'
import { getErrorMessage } from '../api/authApi'
import { toast } from 'react-toastify'
import ActivityFilters from '../components/activity/ActivityFilters'
import ActivityTimeline from '../components/activity/ActivityTimeline'
import './Activity.css'

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
      <ActivityFilters
        activityTypeFilter={activityTypeFilter}
        setActivityTypeFilter={setActivityTypeFilter}
        userIdFilter={userIdFilter}
        setUserIdFilter={setUserIdFilter}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        members={members}
        hasActiveFilters={hasActiveFilters}
        handleClearFilters={handleClearFilters}
      />

      {/* Main Content Area */}
      <ActivityTimeline
        activityGroups={activityGroups}
        activities={activities}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        handleClearFilters={handleClearFilters}
      />

      {/* Simple Pagination Bar */}
      {!isLoading && activities.length > 0 && totalPages > 1 && (
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
    </div>
  );
}
