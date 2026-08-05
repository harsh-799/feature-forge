import { useState, useEffect } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { 
  FiFlag, 
  FiSliders, 
  FiCheckCircle, 
  FiGlobe, 
  FiActivity, 
  FiUsers, 
  FiLayers, 
  FiShield, 
  FiCode, 
  FiCheckSquare,
  FiCornerDownRight
} from 'react-icons/fi'
import { getWorkspaceOverview } from '../../api/workspaceApi'
import { toast } from 'react-toastify'
import './Overview.css'

export default function Overview() {
  const { currentWorkspaceId, currentWorkspaceName } = useOutletContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverviewData = async () => {
    if (!currentWorkspaceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getWorkspaceOverview(currentWorkspaceId);
      setData(res);
    } catch (err) {
      console.error(err);
      setError('Failed to load workspace overview metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, [currentWorkspaceId]);

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
      <div className="overview-page-wrapper">
        <header className="page-header-group">
          <h1 className="page-header-title">Overview</h1>
          <p className="page-header-description">Select a workspace to view dashboard analytics.</p>
        </header>
        <div className="coming-soon-card">
          <FiLayers size={24} style={{ color: 'var(--text-primary)', opacity: 0.6, marginBottom: '12px' }} />
          <h3>No Workspace Active</h3>
          <p>Please select or create a project workspace from the top sidebar selector to display analytics.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="overview-page-wrapper">
        <header className="page-header-group">
          <h1 className="page-header-title">Overview</h1>
          <p className="page-header-description">Loading workspace analytics dashboard...</p>
        </header>
        <div className="loading-container-centered">
          <div className="overview-spinner"></div>
          <p>Analyzing workspace statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overview-page-wrapper">
        <header className="page-header-group">
          <h1 className="page-header-title">Overview</h1>
          <p className="page-header-description">Something went wrong.</p>
        </header>
        <div className="coming-soon-card error-card">
          <FiActivity size={24} style={{ color: '#EF4444', marginBottom: '12px' }} />
          <h3>Failed to Load Overview</h3>
          <p>{error}</p>
          <button className="dashboard-retry-btn" onClick={fetchOverviewData}>Retry Connection</button>
        </div>
      </div>
    );
  }

  const {
    totalFeatureFlags,
    inDevelopmentFlags,
    waitingForQaFlags,
    inProductionFlags,
    pipelineDevelopmentCount,
    pipelineStagingQaCount,
    pipelineProductionCount,
    environments = [],
    teamRoleCounts = {},
    recentActivities = []
  } = data || {};

  return (
    <div className="overview-page-wrapper">
      <header className="page-header-group">
        <h1 className="page-header-title">Overview</h1>
        <p className="page-header-description">
          Monitor release health, environment pipeline states, and team actions in <strong>{currentWorkspaceName}</strong>.
        </p>
      </header>

      {/* Top Statistics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Flags</span>
            <div className="stat-icon-wrapper total">
              <FiFlag size={18} />
            </div>
          </div>
          <span className="stat-number">{totalFeatureFlags}</span>
          <span className="stat-subtitle">Across all lifecycle environments</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">In Development</span>
            <div className="stat-icon-wrapper dev">
              <FiSliders size={18} />
            </div>
          </div>
          <span className="stat-number">{inDevelopmentFlags}</span>
          <span className="stat-subtitle">Being coded or rejected by QA</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Waiting for QA</span>
            <div className="stat-icon-wrapper qa">
              <FiCheckCircle size={18} />
            </div>
          </div>
          <span className="stat-number">{waitingForQaFlags}</span>
          <span className="stat-subtitle">Ready for staging verification</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">In Production</span>
            <div className="stat-icon-wrapper prod">
              <FiGlobe size={18} />
            </div>
          </div>
          <span className="stat-number">{inProductionFlags}</span>
          <span className="stat-subtitle">Serving production customer traffic</span>
        </div>
      </div>

      {/* Release Pipeline Progress Lane */}
      <section className="pipeline-section">
        <div className="section-title-wrapper">
          <FiLayers className="section-title-icon" />
          <h2>Release Pipeline</h2>
        </div>
        <div className="pipeline-lane-container">
          <div className="pipeline-lane">
            <div className="lane-header">
              <div className="lane-indicator dev"></div>
              <span>Development</span>
              <span className="lane-count">{pipelineDevelopmentCount}</span>
            </div>
            <p className="lane-desc">Flags being created, updated, or undergoing redesigns.</p>
          </div>

          <div className="pipeline-divider-arrow">→</div>

          <div className="pipeline-lane">
            <div className="lane-header">
              <div className="lane-indicator staging"></div>
              <span>Staging & QA</span>
              <span className="lane-count">{pipelineStagingQaCount}</span>
            </div>
            <p className="lane-desc">Flags deployed to Staging env and reviewed by QA teams.</p>
          </div>

          <div className="pipeline-divider-arrow">→</div>

          <div className="pipeline-lane">
            <div className="lane-header">
              <div className="lane-indicator production"></div>
              <span>Production</span>
              <span className="lane-count">{pipelineProductionCount}</span>
            </div>
            <p className="lane-desc">Flags verified and approved for Production rollouts.</p>
          </div>
        </div>
      </section>

      {/* Split Details Column */}
      <div className="split-dashboard-row">
        {/* Left Column: Recent Workspace Activities */}
        <div className="activity-card-container">
          <div className="card-header-bar">
            <div className="header-icon-group">
              <FiActivity className="header-icon" />
              <h3>Recent Workspace Activity</h3>
            </div>
            <Link to="/app/activity" className="view-all-activity-link">
              View all activity <FiCornerDownRight size={12} />
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="empty-activities">
              <p>No recent activity logged in this workspace yet.</p>
              <span className="empty-subtext">Actions like creating or updating flags will appear here.</span>
            </div>
          ) : (
            <div className="activity-timeline-wrapper">
              {recentActivities.map((act) => (
                <div key={act.id} className="activity-timeline-item">
                  <div className="activity-timeline-indicator"></div>
                  <div className="activity-timeline-content">
                    <div className="activity-row-meta">
                      <span className={getActionBadgeClass(act.action)}>
                        {act.action.replace('_', ' ')}
                      </span>
                      <span className="activity-time">{formatTimeAgo(act.timestamp)}</span>
                    </div>
                    <p className="activity-summary-text">
                      <strong>{act.actor}</strong> {getActionLabel(act.action)}: <span className="highlight-context">{act.context}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Environments and Team Summary */}
        <div className="dashboard-sidebar-column">
          {/* Environments Card */}
          <div className="dashboard-side-card">
            <div className="side-card-header">
              <FiLayers className="side-icon" />
              <h3>Environments Status</h3>
            </div>
            <div className="env-status-list">
              {environments.map((env) => (
                <div key={env.name} className="env-status-row">
                  <div className="env-info-group">
                    <div className={`env-status-glow-dot ${env.name.toLowerCase()}`}></div>
                    <span className="env-name">{env.name}</span>
                  </div>
                  <span className="env-badge-status-pill">{env.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team Roles Summary Card */}
          <div className="dashboard-side-card">
            <div className="side-card-header">
              <FiUsers className="side-icon" />
              <h3>Team Summary</h3>
            </div>
            <div className="roles-count-list">
              <div className="role-count-row">
                <div className="role-label-group">
                  <FiShield size={14} className="role-icon admin" />
                  <span>Workspace Admins</span>
                </div>
                <span className="role-count-number">{teamRoleCounts.ADMIN || 0}</span>
              </div>
              <div className="role-count-row">
                <div className="role-label-group">
                  <FiCode size={14} className="role-icon dev" />
                  <span>Developers</span>
                </div>
                <span className="role-count-number">{teamRoleCounts.DEVELOPER || 0}</span>
              </div>
              <div className="role-count-row">
                <div className="role-label-group">
                  <FiCheckSquare size={14} className="role-icon qa" />
                  <span>QA Engineers</span>
                </div>
                <span className="role-count-number">{teamRoleCounts.QA || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
