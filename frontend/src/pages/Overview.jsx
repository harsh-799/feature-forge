import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiToggleRight, FiCode, FiGitPullRequest, FiCheckCircle } from 'react-icons/fi';
import FeatureOverview from '../components/overview/FeatureOverview';
import PendingApprovals from '../components/overview/PendingApprovals';
import RecentActivity from '../components/overview/RecentActivity';
import { getFeatureOverview, getWorkspaceActivities } from '../api/workspaceApi';
import { listFeatures, getDeveloperFlags } from '../api/featureApi';
import './Overview.css';

const ACTIVITY_TITLES = {
  WORKSPACE_CREATED: 'Created Workspace',
  WORKSPACE_RENAMED: 'Renamed Workspace',
  WORKSPACE_DELETED: 'Deleted Workspace',
  MEMBER_INVITED: 'Invited Member',
  MEMBER_REMOVED: 'Removed Member',
  MEMBER_LEFT: 'Member Left Workspace',
  INVITATION_ACCEPTED: 'Member Joined Workspace',
  INVITATION_REVOKED: 'Revoked Invitation',
  ENVIRONMENT_KEY_REGENERATED: 'Regenerated Environment Key',
  FEATURE_FLAG_CREATED: 'Created Feature Flag',
  FEATURE_FLAG_UPDATED: 'Updated Feature Flag',
  FEATURE_FLAG_DELETED: 'Deleted Feature Flag',
  FEATURE_FLAG_ENABLED: 'Enabled Feature Flag',
  FEATURE_FLAG_DISABLED: 'Disabled Feature Flag',
  ROLLOUT_PERCENTAGE_UPDATED: 'Updated Rollout Percentage',
  STAGE_PROMOTED: 'Promoted Flag Stage',
  STAGE_REJECTED: 'Rejected Flag Stage',
  FEATURE_CREATED: 'Created Feature'
};

const getTitle = (actType) => {
  if (!actType) return 'Workspace Activity';
  return ACTIVITY_TITLES[actType] || actType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  try {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

export default function Overview() {
  const { currentWorkspaceId, currentWorkspaceName, role } = useOutletContext();
  const activeRole = role || localStorage.getItem('currentWorkspaceRole');

  // Overview counts state
  const [overviewCounts, setOverviewCounts] = useState({
    active: 0,
    development: 0,
    staging: 0,
    production: 0
  });
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  // Pending approvals / action flags state
  const [pendingFeatures, setPendingFeatures] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(true);

  // Recent activities state
  const [activitiesList, setActivitiesList] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  useEffect(() => {
    if (!currentWorkspaceId) return;

    let isMounted = true;

    // Fetch Overview Counts
    setIsLoadingOverview(true);
    getFeatureOverview(currentWorkspaceId)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success) {
          setOverviewCounts({
            active: res.active || 0,
            development: res.development || 0,
            staging: res.staging || 0,
            production: res.production || 0
          });
        }
      })
      .catch(() => {
        // silent catch
      })
      .finally(() => {
        if (isMounted) setIsLoadingOverview(false);
      });

    // Fetch Activities
    setIsLoadingActivities(true);
    getWorkspaceActivities(currentWorkspaceId, { page: 0, size: 4 })
      .then((res) => {
        if (!isMounted) return;
        const rawActivities = res?.activities || (Array.isArray(res) ? res : []);
        const mapped = rawActivities.slice(0, 4).map(act => ({
          title: getTitle(act.activityType),
          description: act.description,
          time: formatRelativeTime(act.createdAt)
        }));
        setActivitiesList(mapped);
      })
      .catch(() => {
        // silent catch
      })
      .finally(() => {
        if (isMounted) setIsLoadingActivities(false);
      });

    // Fetch Pending Features (Role-based)
    setIsLoadingPending(true);
    if (activeRole === 'ADMIN' || activeRole === 'QA') {
      listFeatures(currentWorkspaceId, { environment: 'STAGING', status: 'READY_FOR_QA', page: 0, size: 4 })
        .then((res) => {
          if (!isMounted) return;
          const list = res?.features || (Array.isArray(res) ? res : []);
          setPendingFeatures(list);
        })
        .catch(() => {
          // silent catch
        })
        .finally(() => {
          if (isMounted) setIsLoadingPending(false);
        });
    } else if (activeRole === 'DEVELOPER') {
      getDeveloperFlags(currentWorkspaceId, { page: 0, size: 4 })
        .then((res) => {
          if (!isMounted) return;
          const list = res?.features || (Array.isArray(res) ? res : []);
          setPendingFeatures(list);
        })
        .catch(() => {
          // silent catch
        })
        .finally(() => {
          if (isMounted) setIsLoadingPending(false);
        });
    } else {
      setPendingFeatures([]);
      setIsLoadingPending(false);
    }

    return () => {
      isMounted = false;
    };
  }, [currentWorkspaceId, activeRole]);

  const featureOverviewMetrics = [
    {
      label: 'Active Features',
      value: String(overviewCounts.active),
      subcaption: 'Currently enabled',
      icon: <FiToggleRight size={18} />
    },
    {
      label: 'Development',
      value: String(overviewCounts.development),
      subcaption: 'flags currently in draft',
      icon: <FiCode size={18} />
    },
    {
      label: 'Staging',
      value: String(overviewCounts.staging),
      subcaption: 'flags undergoing testing',
      icon: <FiGitPullRequest size={18} />
    },
    {
      label: 'Production',
      value: String(overviewCounts.production),
      subcaption: 'live flags serving traffic',
      icon: <FiCheckCircle size={18} />
    }
  ];

  return (
    <div className="overview-page">
      <div className="overview-header">
        <span className="overview-badge">WORKSPACE OVERVIEW</span>
        <h1 className="overview-title">
          {currentWorkspaceName || 'Workspace'}
        </h1>
        <p className="overview-desc">
          Manage environments, feature flag keys, and access logs for this project workspace.
        </p>
      </div>

      {/* Feature Overview Section */}
      <FeatureOverview featureOverviewMetrics={featureOverviewMetrics} />

      {/* Two-Column Grid: QA Approvals and Recent Activity */}
      <div className="dashboard-grid-columns">
        <PendingApprovals 
          activeRole={activeRole} 
          pendingQAFeatures={pendingFeatures} 
          isLoading={isLoadingPending} 
        />
        <RecentActivity 
          recentActivities={activitiesList} 
        />
      </div>
    </div>
  );
}
