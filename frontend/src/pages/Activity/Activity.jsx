import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FiClock, FiActivity, FiArrowLeft, FiArrowRight, FiUser } from 'react-icons/fi'
import { getWorkspaceActivity } from '../../api/workspaceApi'
import './Activity.css'

export default function Activity() {
  const { currentWorkspaceId, currentWorkspaceName } = useOutletContext();
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivityLogs = async (targetPage = page) => {
    if (!currentWorkspaceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getWorkspaceActivity(currentWorkspaceId, targetPage, 10);
      if (response) {
        setActivities(response.content || []);
        setTotalPages(response.totalPages || 1);
        setTotalElements(response.totalElements || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load workspace activity logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchActivityLogs(0);
  }, [currentWorkspaceId]);

  const handlePrevPage = () => {
    if (page > 0) {
      const prev = page - 1;
      setPage(prev);
      fetchActivityLogs(prev);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      const next = page + 1;
      setPage(next);
      fetchActivityLogs(next);
    }
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    return `${days}d ago`;
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'CREATED_FEATURE': return 'created feature flag';
      case 'PROMOTED_TO_STAGING': return 'promoted to staging';
      case 'QA_VERIFIED': return 'verified flag in QA';
      case 'QA_REJECTED': return 'rejected flag in QA';
      case 'APPROVED_FOR_PRODUCTION': return 'approved for production';
      case 'ACTIVATED_IN_PRODUCTION': return 'enabled flag in production';
      case 'DEACTIVATED_IN_PRODUCTION': return 'disabled flag in production';
      case 'UPDATED_ROLLOUT': return 'updated production rollout';
      case 'UPDATED_FEATURE': return 'updated feature details';
      case 'SCHEDULED_ACTION': return 'scheduled production action';
      case 'MEMBER_INVITED': return 'invited team member';
      case 'MEMBER_JOINED': return 'joined workspace';
      default: return action.toLowerCase().replace('_', ' ');
    }
  };

  const getActionBadgeClass = (action) => {
    if (action.includes('CREATED') || action.includes('JOINED')) return 'action-badge create';
    if (action.includes('ACTIVATED') || action.includes('VERIFIED') || action.includes('APPROVED')) return 'action-badge success';
    if (action.includes('REJECTED') || action.includes('DEACTIVATED')) return 'action-badge danger';
    return 'action-badge info';
  };

  if (!currentWorkspaceId) {
    return (
      <div className="activity-page-wrapper">
        <header className="page-header-group">
          <h1 className="page-header-title">Activity</h1>
          <p className="page-header-description">Select a workspace to view audit logs.</p>
        </header>
        <div className="coming-soon-card">
          <FiClock size={24} style={{ color: 'var(--text-primary)', opacity: 0.6, marginBottom: '12px' }} />
          <h3>No Workspace Active</h3>
          <p>Please select a workspace to display the change activity audit feed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-page-wrapper">
      <header className="page-header-group">
        <h1 className="page-header-title">Activity</h1>
        <p className="page-header-description">
          Track auditable changes and workspace membership transitions in <strong>{currentWorkspaceName}</strong>.
        </p>
      </header>

      {isLoading ? (
        <div className="loading-container-centered">
          <div className="overview-spinner"></div>
          <p>Loading activity logs...</p>
        </div>
      ) : error ? (
        <div className="coming-soon-card error-card">
          <FiActivity size={24} style={{ color: '#EF4444', marginBottom: '12px' }} />
          <h3>Failed to Load Activity Logs</h3>
          <p>{error}</p>
          <button className="dashboard-retry-btn" onClick={() => fetchActivityLogs(page)}>Retry</button>
        </div>
      ) : activities.length === 0 ? (
        <div className="coming-soon-card">
          <div className="coming-soon-icon-container">
            <FiClock size={24} style={{ color: 'var(--text-primary)', opacity: 0.8 }} />
          </div>
          <h3>Timeline is empty</h3>
          <p>
            No events have been logged inside this workspace yet. Events like flag updates or user invitations will list here.
          </p>
        </div>
      ) : (
        <div className="activity-feed-layout">
          <div className="activity-feed-card">
            <div className="activity-feed-timeline">
              {activities.map((act) => (
                <div key={act.id} className="feed-item-row">
                  <div className="feed-item-indicator-circle">
                    <FiUser size={12} className="feed-actor-icon" />
                  </div>
                  <div className="feed-item-box-content">
                    <div className="feed-item-header-meta">
                      <div className="feed-action-group">
                        <span className={getActionBadgeClass(act.action)}>
                          {act.action.replace('_', ' ')}
                        </span>
                        <span className="feed-actor-name">{act.actor}</span>
                        <span className="feed-action-desc">{getActionLabel(act.action)}</span>
                      </div>
                      <span className="feed-time-stamp" title={formatFullDate(act.timestamp)}>
                        {formatTimeAgo(act.timestamp)}
                      </span>
                    </div>
                    <div className="feed-item-body">
                      Context element: <span className="highlight-context">{act.context}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="feed-pagination-bar">
                <button 
                  className="feed-pagination-btn" 
                  disabled={page === 0} 
                  onClick={handlePrevPage}
                  type="button"
                >
                  <FiArrowLeft size={14} style={{ marginRight: '6px' }} /> Previous
                </button>
                <span className="feed-pagination-label">
                  Page {page + 1} of {totalPages} <span className="elements-count">({totalElements} events)</span>
                </span>
                <button 
                  className="feed-pagination-btn" 
                  disabled={page === totalPages - 1} 
                  onClick={handleNextPage}
                  type="button"
                >
                  Next <FiArrowRight size={14} style={{ marginLeft: '6px' }} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
