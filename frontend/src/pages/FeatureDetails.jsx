import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { FiArrowLeft, FiCheckCircle, FiActivity, FiAlertTriangle, FiSliders, FiLock, FiX } from 'react-icons/fi'
import {
  getFeatureDetails,
  updateFeature,
  promoteFeature,
  repromoteFeature,
  verifyFeatureQA,
  rejectFeatureQA,
  approveFeatureProduction,
  activateFeatureProduction,
  updateRolloutProduction,
  deactivateFeatureProduction,
  activateFeatureDevelopment,
  deactivateFeatureDevelopment,
  activateFeatureStaging,
  deactivateFeatureStaging,
  deleteFeature,
  scheduleProductionAction,
  deleteProductionSchedule
} from '../api/featureApi'
import { getErrorMessage } from '../api/authApi'
import { toast } from 'react-toastify'
import './FeatureDetails.css'

const getActionLabel = (action) => {
  switch (action) {
    case 'ACTIVATE':
      return 'Activate Feature';
    case 'UPDATE_ROLLOUT':
      return 'Update Rollout';
    case 'DEACTIVATE':
      return 'Deactivate Feature';
    default:
      return action;
  }
};

const formatScheduleTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  
  const formattedDate = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  return `${formattedDate} · ${formattedTime}`;
};

export default function FeatureDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentWorkspaceId, role } = useOutletContext();
  const activeRole = role || localStorage.getItem('currentWorkspaceRole') || 'DEVELOPER';

  const [feature, setFeature] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QA Rejection state
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Production activation state
  const [isActivating, setIsActivating] = useState(false);
  const [actRollout, setActRollout] = useState(10); // Default initial rollout 10%

  // Production rollout adjustment
  const [rolloutVal, setRolloutVal] = useState(50);
  const [isSavingRollout, setIsSavingRollout] = useState(false);

  // Scheduled production actions state
  const [scheduleAction, setScheduleAction] = useState('ACTIVATE');
  const [scheduleRollout, setScheduleRollout] = useState(10);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleToCancel, setScheduleToCancel] = useState(null);

  // Custom confirmation modal
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Environment config toggle state
  const [isTogglingEnv, setIsTogglingEnv] = useState(false);

  // Authority flags: Based on activeRole
  const isAdminOrDev = activeRole === 'ADMIN' || activeRole === 'DEVELOPER';
  const isQA = activeRole === 'QA';
  const isAdmin = activeRole === 'ADMIN';

  const todayStr = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const loadFeatureDetails = async (showSkeleton = true) => {
    if (!id || !currentWorkspaceId) return;

    if (showSkeleton) setIsLoading(true);
    const startTime = Date.now();
    try {
      const response = await getFeatureDetails(id, currentWorkspaceId);

      if (response && response.success) {
        const data = response.data;

        // Enforce a minimum loader duration of 350ms to prevent skeleton screen flashing/flicker
        if (showSkeleton) {
          const elapsed = Date.now() - startTime;
          const minDelay = 350;
          if (elapsed < minDelay) {
            await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
          }
        }

        setFeature(data);
        setEditName(data.name);
        setEditDesc(data.description || '');

        // Load active production rollout value
        const prodConfig = data.environments.find(e => e.name === 'PRODUCTION');
        if (prodConfig) {
          setRolloutVal(prodConfig.rolloutPercentage ?? 0);
          if (prodConfig.enabled) {
            setScheduleAction('UPDATE_ROLLOUT');
            setScheduleRollout(prodConfig.rolloutPercentage !== null && prodConfig.rolloutPercentage !== undefined ? prodConfig.rolloutPercentage : 50);
          } else {
            setScheduleAction('ACTIVATE');
            setScheduleRollout(10);
          }
        } else {
          setScheduleAction('ACTIVATE');
          setScheduleRollout(10);
        }
      } else {
        toast.error(response?.message || 'Failed to load feature flag details.');
        navigate('/app/features');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      navigate('/app/features');
    } finally {
      if (showSkeleton) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeatureDetails();
  }, [id, currentWorkspaceId]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!editName.trim()) {
      toast.error('Feature name cannot be blank.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        workspaceId: currentWorkspaceId
      };

      const trimmedName = editName.trim();
      const trimmedDesc = editDesc.trim();

      if (trimmedName !== feature.name) {
        payload.name = trimmedName;
      }

      if (trimmedDesc !== (feature.description || '')) {
        payload.description = trimmedDesc || null;
      }

      await updateFeature(id, payload);
      toast.success('Feature details updated successfully!');
      loadFeatureDetails();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromote = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await promoteFeature(id, { workspaceID: currentWorkspaceId });
      toast.success('Feature flag promoted to Staging / QA!');
      loadFeatureDetails();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRepromote = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await repromoteFeature(id, { workspaceID: currentWorkspaceId });
      toast.success('Feature flag re-promoted to QA!');
      loadFeatureDetails();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQAApprove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await verifyFeatureQA(id, { workspaceId: currentWorkspaceId });
      toast.success('QA Approval complete. Feature is verified!');
      loadFeatureDetails();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQAReject = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }

    setIsSubmitting(true);
    try {
      await rejectFeatureQA(id, {
        workspaceId: currentWorkspaceId,
        rejectionReason: rejectionReason.trim()
      });
      toast.success('QA Rejection submitted.');
      setIsRejecting(false);
      setRejectionReason('');
      loadFeatureDetails();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveProduction = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await approveFeatureProduction(id, { workspaceId: currentWorkspaceId });
      toast.success('Feature approved for PRODUCTION release!');
      loadFeatureDetails();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateProduction = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await activateFeatureProduction(id, {
        workspaceId: currentWorkspaceId,
        rolloutPercentage: actRollout
      });
      toast.success('Feature activated in PRODUCTION!');
      setIsActivating(false);
      await loadFeatureDetails(false);
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateProduction = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deactivateFeatureProduction(id, { workspaceId: currentWorkspaceId });
      toast.success('Feature deactivated in PRODUCTION.');
      setConfirmDeactivate(false);
      await loadFeatureDetails(false);
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRollout = async () => {
    if (isSavingRollout) return;
    setIsSavingRollout(true);
    try {
      await updateRolloutProduction(id, {
        workspaceId: currentWorkspaceId,
        rolloutPercentage: rolloutVal
      });
      toast.success(`Production rollout updated to ${rolloutVal}%!`);
      await loadFeatureDetails(false);
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsSavingRollout(false);
    }
  };

  const handleDeleteFeature = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deleteFeature(id, { workspaceId: currentWorkspaceId });
      toast.success('Feature flag deleted successfully!');
      setConfirmDelete(false);
      navigate('/app/features');
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      setConfirmDelete(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionChange = (actionVal) => {
    setScheduleAction(actionVal);
    if (actionVal === 'UPDATE_ROLLOUT') {
      const prodConfig = feature?.environments?.find(e => e.name === 'PRODUCTION');
      setScheduleRollout(prodConfig && prodConfig.rolloutPercentage !== null && prodConfig.rolloutPercentage !== undefined ? prodConfig.rolloutPercentage : 50);
    } else if (actionVal === 'ACTIVATE') {
      setScheduleRollout(10);
    } else {
      setScheduleRollout(0);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (isScheduling) return;

    if (!scheduleDate || !scheduleTime) {
      toast.error('Please select both a date and time.');
      return;
    }

    const scheduledDateTimeStr = `${scheduleDate}T${scheduleTime}:00`;
    const scheduledDateTime = new Date(scheduledDateTimeStr);
    const now = new Date();

    if (scheduledDateTime <= now) {
      toast.error('Scheduled date and time must be in the future.');
      return;
    }

    let targetRollout = null;
    if (scheduleAction !== 'DEACTIVATE') {
      const rollout = parseInt(scheduleRollout, 10);
      if (isNaN(rollout) || rollout < 1 || rollout > 100) {
        toast.error('Rollout percentage must be between 1 and 100.');
        return;
      }
      targetRollout = rollout;
    }

    setIsScheduling(true);
    try {
      const payload = {
        workspaceId: currentWorkspaceId,
        action: scheduleAction,
        targetRollout: targetRollout,
        scheduledAt: scheduledDateTimeStr
      };

      const response = await scheduleProductionAction(id, payload);

      if (response && response.success) {
        const formattedTime = new Date(response.scheduledAt).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
        toast.success(`${response.message || 'Feature action scheduled successfully.'} (Earliest execution: ${formattedTime})`);
        
        // Reset scheduling form date and time
        setScheduleDate('');
        setScheduleTime('');
        // Reload details
        await loadFeatureDetails(false);
      } else {
        toast.error(response?.message || 'Failed to schedule feature action.');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancelSchedule = async () => {
    if (!scheduleToCancel) return;
    const scheduleId = scheduleToCancel.id;
    setScheduleToCancel(null);
    setIsSubmitting(true);
    try {
      await deleteProductionSchedule(id, scheduleId, { workspaceId: currentWorkspaceId });
      toast.success('Scheduled action cancelled successfully.');
      await loadFeatureDetails(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to cancel scheduled action.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEnvironment = async (envName, currentEnabled) => {
    if (isTogglingEnv) return;
    setIsTogglingEnv(true);
    try {
      let response;
      if (envName === 'DEVELOPMENT') {
        if (currentEnabled) {
          response = await deactivateFeatureDevelopment(id, { workspaceId: currentWorkspaceId });
        } else {
          response = await activateFeatureDevelopment(id, { workspaceId: currentWorkspaceId });
        }
      } else if (envName === 'STAGING') {
        if (currentEnabled) {
          response = await deactivateFeatureStaging(id, { workspaceId: currentWorkspaceId });
        } else {
          response = await activateFeatureStaging(id, { workspaceId: currentWorkspaceId });
        }
      }

      if (response && response.success) {
        toast.success(response.message || `${envName} environment configuration updated successfully.`);
      } else {
        toast.error(response?.message || `Failed to update ${envName} environment.`);
      }
      await loadFeatureDetails(false);
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsTogglingEnv(false);
    }
  };

  if (isLoading || !feature) {
    return (
      <div className="detail-skeleton-screen pulse">
        <div className="skeleton-detail-header"></div>
        <div className="skeleton-detail-timeline"></div>
        <div className="skeleton-detail-row">
          <div className="skeleton-detail-box left"></div>
          <div className="skeleton-detail-box right"></div>
        </div>
      </div>
    );
  }

  const devConfig = feature.environments.find(e => e.name === 'DEVELOPMENT');
  const stagingConfig = feature.environments.find(e => e.name === 'STAGING');
  const prodConfig = feature.environments.find(e => e.name === 'PRODUCTION');

  const isDevEnabled = devConfig ? devConfig.enabled : false;
  const isStagingEnabled = stagingConfig ? stagingConfig.enabled : false;
  const isProdEnabled = prodConfig ? prodConfig.enabled : false;

  return (
    <div className="flag-details-container">
      <Link to="/app/features" className="back-nav-link">
        <FiArrowLeft className="icon-margin-right" /> Back to Feature Flags
      </Link>

      <header className="details-main-header">
        <div className="details-header-title-row">
          <div>
            <h1 className="details-flag-name">{feature.name}</h1>
            <div className="details-flag-meta-row">
              <code className="details-flag-key-box">{feature.key}</code>
              <span className="details-meta-bullet">•</span>
              <span className="details-flag-date-label">Created {new Date(feature.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="details-header-action">
            <span className={`status-badge-indicator ${feature.status.toLowerCase().replace(/_/g, '-')}`}>
              {feature.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </header>

      {/* Lifecycle Timeline */}
      <div className="timeline-stages-card">
        <div className="timeline-stage-title-row">
          <h4>FLAG RELEASE LIFECYCLE</h4>
        </div>
        <div className="timeline-track-wrapper">
          <div className="timeline-track">
            <div className="timeline-step finished">
              <div className="step-node">1</div>
              <div className="step-label">Development</div>
            </div>

            <div className={`timeline-connector ${feature.status !== 'IN_DEVELOPMENT' ? 'finished' : ''}`}></div>

            <div className={`timeline-step ${feature.status === 'READY_FOR_QA' || feature.status === 'QA_VERIFIED' || feature.status === 'QA_REJECTED' || feature.status === 'IN_PRODUCTION'
                ? 'finished' : ''
              } ${feature.status === 'QA_REJECTED' ? 'rejected' : ''}`}>
              <div className="step-node">2</div>
              <div className="step-label">Staging / QA</div>
            </div>

            <div className={`timeline-connector ${feature.status === 'IN_PRODUCTION' ? 'finished' : ''}`}></div>

            <div className={`timeline-step ${feature.status === 'IN_PRODUCTION' ? 'finished' : ''}`}>
              <div className="step-node">3</div>
              <div className="step-label">Production</div>
            </div>
          </div>
        </div>
      </div>

      <div className="details-content-grid">
        <div className="details-left-pane">
          {/* Flag Details Card */}
          <div className="details-section-card">
            <h3>Flag Details</h3>
            <form onSubmit={handleEditSubmit} className="details-form">
              <div className="details-form-group">
                <label htmlFor="featureName" className="details-form-label">FEATURE NAME</label>
                <input
                  type="text"
                  id="featureName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="details-form-input"
                  disabled={feature.status !== 'IN_DEVELOPMENT' || isSubmitting}
                  required
                />
              </div>
              <div className="details-form-group">
                <label htmlFor="featureDesc" className="details-form-label">DESCRIPTION</label>
                <textarea
                  id="featureDesc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="details-form-textarea"
                  rows={3}
                  disabled={feature.status !== 'IN_DEVELOPMENT' || isSubmitting}
                  placeholder="Describe what this feature flag does..."
                />
              </div>

              {feature.status === 'IN_DEVELOPMENT' ? (
                <div className="details-actions-row">
                  <button
                    type="submit"
                    className="details-save-btn"
                    disabled={isSubmitting || (editName.trim() === feature.name && editDesc.trim() === (feature.description || ''))}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="metadata-locked-banner">
                  <FiLock size={14} className="lock-icon" />
                  <span>Name and description are locked because this flag has progressed beyond Development.</span>
                </div>
              )}
            </form>
          </div>

          {/* Release Configuration Section */}
          <div className="details-section-card release-config-card">
            <h3>Release Configuration</h3>
            <p className="section-subtitle">Manage evaluation rules, toggle states, and progressive rollout boundaries across pipeline environments.</p>

            <div className="environments-configs-stack">
              {/* DEVELOPMENT Config */}
              <div className="env-config-group">
                <div className="env-config-header">
                  <div className="env-header-left">
                    <span className="env-dot dev"></span>
                    <span className="env-name">DEVELOPMENT</span>
                  </div>
                  {isAdminOrDev && feature.status === 'IN_DEVELOPMENT' ? (
                    <label className="toggle-switch-container" title="Toggle Development Flag">
                      <input
                        type="checkbox"
                        checked={isDevEnabled}
                        disabled={isTogglingEnv}
                        onChange={() => handleToggleEnvironment('DEVELOPMENT', isDevEnabled)}
                      />
                      <span className="toggle-switch-slider"></span>
                    </label>
                  ) : (
                    <span className={`env-status-badge ${isDevEnabled ? 'active' : 'inactive'}`}>
                      {isDevEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>
                <div className="env-config-body">
                  <div className="config-item-row">
                    <span className="config-label">Progressive Rollout</span>
                    <span className="config-value">{isDevEnabled ? '100%' : '0%'}</span>
                  </div>
                  <div className="config-progress-bar">
                    <div className="progress-fill dev" style={{ width: isDevEnabled ? '100%' : '0%' }}></div>
                  </div>
                  <div className="config-item-row targeting-row">
                    <span className="config-label">Targeting Rules</span>
                    <span className="config-value-placeholder">All developers (Default)</span>
                  </div>
                </div>
              </div>

              {/* STAGING Config */}
              <div className="env-config-group">
                <div className="env-config-header">
                  <div className="env-header-left">
                    <span className="env-dot staging"></span>
                    <span className="env-name">STAGING / QA</span>
                  </div>
                  {(isAdminOrDev || isQA) && feature.status === 'READY_FOR_QA' ? (
                    <label className="toggle-switch-container" title="Toggle Staging Flag">
                      <input
                        type="checkbox"
                        checked={isStagingEnabled}
                        disabled={isTogglingEnv}
                        onChange={() => handleToggleEnvironment('STAGING', isStagingEnabled)}
                      />
                      <span className="toggle-switch-slider"></span>
                    </label>
                  ) : (
                    <span className={`env-status-badge ${isStagingEnabled ? 'active' : 'inactive'}`}>
                      {isStagingEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>
                <div className="env-config-body">
                  <div className="config-item-row">
                    <span className="config-label">Progressive Rollout</span>
                    <span className="config-value">{isStagingEnabled ? '100%' : '0%'}</span>
                  </div>
                  <div className="config-progress-bar">
                    <div className="progress-fill staging" style={{ width: isStagingEnabled ? '100%' : '0%' }}></div>
                  </div>
                  <div className="config-item-row targeting-row">
                    <span className="config-label">Targeting Rules</span>
                    <span className="config-value-placeholder">QA testers (Default)</span>
                  </div>
                </div>
              </div>

              {/* PRODUCTION Config */}
              <div className="env-config-group">
                <div className="env-config-header">
                  <div className="env-header-left">
                    <span className="env-dot production"></span>
                    <span className="env-name">PRODUCTION</span>
                  </div>
                  <span className={`env-status-badge ${isProdEnabled ? 'active' : 'inactive'}`}>
                    {isProdEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="env-config-body">
                  <div className="config-item-row">
                    <span className="config-label">Progressive Rollout</span>
                    <span className="config-value">{isProdEnabled ? `${rolloutVal}%` : '0%'}</span>
                  </div>
                  <div className="config-progress-bar">
                    <div className="progress-fill production" style={{ width: isProdEnabled ? `${rolloutVal}%` : '0%' }}></div>
                  </div>
                  <div className="config-item-row targeting-row">
                    <span className="config-label">Targeting Rules</span>
                    <span className="config-value-placeholder">Percentage-based rollout (All Users)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Feature Card */}
          {isAdminOrDev && !(feature.status === 'IN_PRODUCTION' && activeRole === 'DEVELOPER') && (
            <div className="details-section-card delete-feature-card" style={{ marginTop: '24px' }}>
              <h3 style={{ marginBottom: '4px' }}>Delete Feature</h3>
              <p className="section-subtitle" style={{ marginBottom: '16px' }}>
                Permanently remove this feature and its environment configurations. This action cannot be undone.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rejection-submit-btn"
                  style={{ backgroundColor: '#EF4444', borderColor: '#EF4444', padding: '10px 20px', fontSize: '13px', fontWeight: '600' }}
                >
                  Delete Feature
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Active Controls */}
        <div className="details-right-pane">
          <div className="details-section-card action-card">
            <h3>Release Controls</h3>

            {/* Stage: IN_DEVELOPMENT */}
            {feature.status === 'IN_DEVELOPMENT' && (
              <div className="action-stage-box">
                <div className="action-stage-info">
                  <FiSliders size={20} className="action-stage-icon" />
                  <div>
                    <h4>Promote to Staging / QA</h4>
                    <p>When you are finished coding, promote this feature flag to Staging to enable QA verification.</p>
                  </div>
                </div>
                {isAdminOrDev ? (
                  <button
                    onClick={handlePromote}
                    className="action-primary-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Promoting...' : 'Promote to Staging'}
                  </button>
                ) : (
                  <div className="locked-action-overlay">
                    <FiLock size={14} style={{ marginRight: '6px' }} />
                    <span>Promoting requires Admin or Developer authority.</span>
                  </div>
                )}
              </div>
            )}

            {/* Stage: READY_FOR_QA */}
            {feature.status === 'READY_FOR_QA' && (
              <div className="action-stage-box">
                <div className="action-stage-info">
                  <FiActivity size={20} className="action-stage-icon orange" />
                  <div>
                    <h4>QA Verification Pending</h4>
                    <p>This feature flag is active in Staging. Perform verification and approve or reject the flag.</p>
                  </div>
                </div>

                {isQA ? (
                  isRejecting ? (
                    <form onSubmit={handleQAReject} className="rejection-form">
                      <label htmlFor="rejectionInput" className="rejection-label">REJECTION REASON</label>
                      <textarea
                        id="rejectionInput"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Specify what checks failed so developers can address them."
                        rows={3}
                        className="rejection-textarea"
                        required
                        disabled={isSubmitting}
                      />
                      <div className="rejection-form-actions">
                        <button
                          type="button"
                          onClick={() => setIsRejecting(false)}
                          className="rejection-cancel-btn"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rejection-submit-btn"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Reject Flag'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="qa-actions-row">
                      <button
                        onClick={() => setIsRejecting(true)}
                        className="qa-reject-btn"
                        disabled={isSubmitting}
                      >
                        Reject Flag
                      </button>
                      <button
                        onClick={handleQAApprove}
                        className="qa-approve-btn"
                        disabled={isSubmitting}
                      >
                        Approve & Verify
                      </button>
                    </div>
                  )
                ) : (
                  <div className="locked-action-overlay">
                    <FiLock size={14} className="icon-margin-right" />
                    <span>Review and approvals require QA Engineer authority.</span>
                  </div>
                )}
              </div>
            )}

            {/* Stage: QA_REJECTED */}
            {feature.status === 'QA_REJECTED' && (
              <div className="action-stage-box">
                <div className="action-stage-info">
                  <FiAlertTriangle size={20} className="action-stage-icon red" />
                  <div>
                    <h4>QA Verification Rejected</h4>
                    <p>The flag was rejected during verification. Address the failures and re-promote when ready.</p>
                  </div>
                </div>

                <div className="rejection-reason-notice">
                  <strong>REJECTION REASON:</strong>
                  <p>{feature.rejectionReason}</p>
                </div>

                {isAdminOrDev ? (
                  <button
                    onClick={handleRepromote}
                    className="action-primary-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Re-promoting...' : 'Re-promote to QA'}
                  </button>
                ) : (
                  <div className="locked-action-overlay">
                    <FiLock size={14} style={{ marginRight: '6px' }} />
                    <span>Re-promoting requires Admin or Developer authority.</span>
                  </div>
                )}
              </div>
            )}

            {/* Stage: QA_VERIFIED */}
            {feature.status === 'QA_VERIFIED' && (
              <div className="action-stage-box">
                <div className="action-stage-info">
                  <FiCheckCircle size={20} className="action-stage-icon green" />
                  <div>
                    <h4>Ready for Production Release</h4>
                    <p>This flag has passed QA checks. Approve release into production environments.</p>
                  </div>
                </div>
                {isAdmin ? (
                  <button
                    onClick={handleApproveProduction}
                    className="action-primary-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Approving...' : 'Release to Production'}
                  </button>
                ) : (
                  <div className="locked-action-overlay">
                    <FiLock size={14} style={{ marginRight: '6px' }} />
                    <span>Production releases require Admin authority.</span>
                  </div>
                )}
              </div>
            )}

            {/* Stage: IN_PRODUCTION */}
            {feature.status === 'IN_PRODUCTION' && (
              <div className="action-stage-box production-controls">
                {isProdEnabled ? (
                  /* Active in Production state panel */
                  <div className="production-active-panel">
                    <div className="production-status-indicator" style={{ marginBottom: isAdmin ? '20px' : '0px', borderBottom: isAdmin ? '1px solid var(--border-color)' : 'none', paddingBottom: isAdmin ? '16px' : '0px' }}>
                      <div className="status-indicator-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0 }}>Production Status</h4>
                        <span className="status-badge-indicator in-production" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10B981', textTransform: 'uppercase', padding: '4px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '800', letterSpacing: '0.04em' }}>ACTIVE</span>
                      </div>
                      <div className="status-indicator-detail">
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Current Rollout: <strong>{prodConfig?.rolloutPercentage}%</strong></span>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="production-rollout-section">
                        <div className="rollout-section-header">
                          <div>
                            <h4>Rollout Management</h4>
                            <p>Incrementally release this feature flag to a segment of your audience.</p>
                          </div>
                          <span className="rollout-value-text">{rolloutVal}%</span>
                        </div>

                        <div className="rollout-slider-track-container">
                          <span className="slider-bound">0%</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={rolloutVal}
                            onChange={(e) => setRolloutVal(parseInt(e.target.value))}
                            className="rollout-slider-range"
                            disabled={isSavingRollout || !isAdmin}
                            style={{
                              background: `linear-gradient(to right, #FF6B00 0%, #FF6B00 ${rolloutVal}%, #E5E2DA ${rolloutVal}%, #E5E2DA 100%)`
                            }}
                          />
                          <span className="slider-bound">100%</span>
                        </div>

                        <div className="rollout-actions-row" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                          <button
                            onClick={handleSaveRollout}
                            className="action-primary-btn"
                            disabled={isSavingRollout || rolloutVal === (prodConfig?.rolloutPercentage ?? 0)}
                            style={{ flex: 1 }}
                          >
                            {isSavingRollout ? 'Saving Rollout...' : 'Update Rollout'}
                          </button>
                          <button
                            onClick={() => setConfirmDeactivate(true)}
                            className="production-state-toggle-btn active"
                            disabled={isSubmitting}
                            style={{ width: 'auto', padding: '10px 16px', margin: 0 }}
                          >
                            Deactivate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Inactive / Activation controls state */
                  <div className="production-toggle-section">
                    <div className="toggle-label-group">
                      <h4>Production Release State</h4>
                      <p>Control whether this flag is evaluated to true in the production environment.</p>
                    </div>

                    {isAdmin ? (
                      isActivating ? (
                        <form onSubmit={handleActivateProduction} className="activation-form">
                          <div className="activation-form-group">
                            <label htmlFor="initialRollout" className="activation-label">INITIAL ROLLOUT TARGET</label>
                            <div className="activation-input-row">
                              <input
                                type="range"
                                id="initialRollout"
                                min="0"
                                max="100"
                                value={actRollout}
                                onChange={(e) => setActRollout(parseInt(e.target.value))}
                                className="rollout-slider-range"
                                style={{
                                  background: `linear-gradient(to right, #FF6B00 0%, #FF6B00 ${actRollout}%, #E5E2DA ${actRollout}%, #E5E2DA 100%)`
                                }}
                              />
                              <span className="slider-percentage-badge">{actRollout}%</span>
                            </div>
                          </div>
                          <div className="activation-form-actions">
                            <button
                              type="button"
                              onClick={() => setIsActivating(false)}
                              className="rejection-cancel-btn"
                              disabled={isSubmitting}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="rejection-submit-btn production-activate-btn"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Activating...' : 'Activate Feature'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setIsActivating(true)}
                          className="production-state-toggle-btn inactive"
                          disabled={isSubmitting}
                        >
                          Activate Feature
                        </button>
                      )
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                          className="production-state-toggle-btn inactive"
                          disabled={true}
                          style={{ opacity: 0.5, cursor: 'not-allowed' }}
                        >
                          Activate Feature
                        </button>
                        <div className="locked-action-overlay" style={{ marginTop: 0 }}>
                          <FiLock size={14} style={{ marginRight: '6px' }} />
                          <span>Production activation is read-only for your role. Only Admins can release.</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Scheduling Area */}
                <div className="schedule-container">
                  {!isProdEnabled ? (
                    <>
                      <h4 className="schedule-header">Schedule a Release</h4>
                      <p className="schedule-subheader">Set a future time and rollout percentage to automatically enable this feature flag in production.</p>
                    </>
                  ) : (
                    <>
                      <h4 className="schedule-header">Schedule a Production Change</h4>
                      <p className="schedule-subheader">Plan a progressive rollout modification or feature deactivation in production for a future time.</p>
                    </>
                  )}

                  <form onSubmit={handleScheduleSubmit} className="activation-form schedule-form-element">
                    {/* Action Selector: only visible if active (isProdEnabled is true) */}
                    {isProdEnabled && (
                      <div className="details-form-group">
                        <label htmlFor="scheduleActionInput" className="details-form-label">ACTION</label>
                        <select
                          id="scheduleActionInput"
                          value={scheduleAction}
                          onChange={(e) => handleActionChange(e.target.value)}
                          className="details-form-input"
                          disabled={isScheduling || !isAdmin}
                        >
                          <option value="UPDATE_ROLLOUT">Update Rollout</option>
                          <option value="DEACTIVATE">Deactivate Feature</option>
                        </select>
                      </div>
                    )}

                    {/* Rollout Percentage: visible for ACTIVATE and UPDATE_ROLLOUT */}
                    {scheduleAction !== 'DEACTIVATE' && (
                      <div className="details-form-group">
                        <label htmlFor="scheduleRolloutInput" className="details-form-label">
                          {scheduleAction === 'ACTIVATE' ? 'ROLLOUT PERCENTAGE' : 'TARGET ROLLOUT'}
                        </label>
                        <div className="activation-input-row">
                          <input
                            type="range"
                            id="scheduleRolloutInput"
                            min="1"
                            max="100"
                            value={scheduleRollout || 1}
                            onChange={(e) => setScheduleRollout(parseInt(e.target.value, 10))}
                            className="rollout-slider-range"
                            disabled={isScheduling || !isAdmin}
                            style={{
                              background: `linear-gradient(to right, #FF6B00 0%, #FF6B00 ${scheduleRollout || 1}%, #E5E2DA ${scheduleRollout || 1}%, #E5E2DA 100%)`
                            }}
                          />
                          <span className="slider-percentage-badge">{scheduleRollout || 1}%</span>
                        </div>
                      </div>
                    )}

                    {/* Date Picker */}
                    <div className="details-form-group">
                      <label htmlFor="scheduleDateInput" className="details-form-label">
                        {!isProdEnabled ? 'RELEASE DATE' : 'DATE'}
                      </label>
                      <input
                        type="date"
                        id="scheduleDateInput"
                        value={scheduleDate}
                        min={todayStr}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="details-form-input"
                        disabled={isScheduling || !isAdmin}
                        required
                      />
                    </div>

                    {/* Time Picker */}
                    <div className="details-form-group">
                      <label htmlFor="scheduleTimeInput" className="details-form-label">
                        {!isProdEnabled ? 'RELEASE TIME' : 'TIME'}
                      </label>
                      <input
                        type="time"
                        id="scheduleTimeInput"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="details-form-input"
                        disabled={isScheduling || !isAdmin}
                        required
                      />
                    </div>

                    {/* Helper note about scheduler cycle timing */}
                    <p className="schedule-timing-note">
                      Actions execute on the first scheduler cycle (up to 10 seconds delay) after the selected time.
                    </p>

                    {/* Submit Button / Locked overlay */}
                    {isAdmin ? (
                      <button
                        type="submit"
                        className="action-primary-btn"
                        disabled={isScheduling}
                        style={{ marginTop: '8px' }}
                      >
                        {isScheduling ? 'Scheduling...' : !isProdEnabled ? 'Schedule Release' : 'Schedule Change'}
                      </button>
                    ) : (
                      <div className="locked-action-overlay" style={{ marginTop: '12px' }}>
                        <FiLock size={14} style={{ marginRight: '6px' }} />
                        <span>Scheduling production actions requires Admin authority.</span>
                      </div>
                    )}
                  </form>
                </div>

                {/* Upcoming Scheduled Changes Section */}
                <div className="upcoming-schedules-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                  <div className="upcoming-schedules-header-group">
                    <h4 className="schedule-header">Upcoming Scheduled Changes</h4>
                    <p className="schedule-subheader">Production actions scheduled for this feature.</p>
                  </div>

                  {feature.scheduledChanges && feature.scheduledChanges.filter(s => s.status === 'PENDING').length > 0 ? (
                    <div className="schedule-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                      {feature.scheduledChanges
                        .filter(s => s.status === 'PENDING')
                        .map((change) => (
                          <div key={change.id} className="schedule-item-card">
                            <div className="schedule-item-header">
                              <span className="schedule-item-action">{getActionLabel(change.action)}</span>
                              <span className="status-badge-indicator pending">PENDING</span>
                            </div>

                            {change.action !== 'DEACTIVATE' && (
                              <div className="schedule-item-detail">
                                <span className="schedule-detail-label">Rollout</span>
                                <span className="schedule-detail-value">{change.rolloutPercentage}%</span>
                              </div>
                            )}

                            <div className="schedule-item-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
                              <div className="schedule-item-time" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span className="schedule-time-label">Scheduled for</span>
                                <span className="schedule-time-value">{formatScheduleTime(change.scheduledAt)}</span>
                              </div>

                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => setScheduleToCancel(change)}
                                  className="schedule-cancel-action-btn"
                                >
                                  Cancel Schedule
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <p className="schedule-subheader" style={{ fontStyle: 'italic', opacity: 0.6, margin: 0 }}>
                      No upcoming changes scheduled.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deactivation Confirmation Modal */}
      {confirmDeactivate && createPortal(
        <div className="modal-overlay" onClick={() => !isSubmitting && setConfirmDeactivate(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Deactivate Feature Flag?</h3>
              <button className="modal-close-btn" onClick={() => !isSubmitting && setConfirmDeactivate(false)} disabled={isSubmitting}>
                <FiX size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '8px 0 20px 0' }}>
              <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.5', margin: 0 }}>
                Are you sure you want to deactivate this feature in Production? This will immediately stop serving the feature to users.
              </p>
            </div>
            <div className="modal-actions-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button
                onClick={() => setConfirmDeactivate(false)}
                className="rejection-cancel-btn"
                disabled={isSubmitting}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateProduction}
                className="rejection-submit-btn"
                disabled={isSubmitting}
                style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#EF4444', borderColor: '#EF4444' }}
              >
                {isSubmitting ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && createPortal(
        <div className="modal-overlay" onClick={() => !isSubmitting && setConfirmDelete(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Delete Feature Flag?</h3>
              <button className="modal-close-btn" onClick={() => !isSubmitting && setConfirmDelete(false)} disabled={isSubmitting}>
                <FiX size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '8px 0 20px 0' }}>
              <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.5', margin: 0 }}>
                Are you sure you want to delete this feature flag? The feature flag and all of its environment configurations will be permanently removed. This action cannot be undone.
              </p>
            </div>
            <div className="modal-actions-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rejection-cancel-btn"
                disabled={isSubmitting}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFeature}
                className="rejection-submit-btn"
                disabled={isSubmitting}
                style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#EF4444', borderColor: '#EF4444' }}
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Cancel Schedule Confirmation Modal */}
      {scheduleToCancel && createPortal(
        <div className="modal-overlay" onClick={() => !isSubmitting && setScheduleToCancel(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Cancel Scheduled Action?</h3>
              <button className="modal-close-btn" onClick={() => !isSubmitting && setScheduleToCancel(null)} disabled={isSubmitting}>
                <FiX size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '8px 0 20px 0' }}>
              <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.5', margin: 0 }}>
                Are you sure you want to cancel the scheduled <strong>{getActionLabel(scheduleToCancel.action)}</strong> action? This will prevent it from executing in production.
              </p>
            </div>
            <div className="modal-actions-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button
                onClick={() => setScheduleToCancel(null)}
                className="rejection-cancel-btn"
                disabled={isSubmitting}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCancelSchedule}
                className="rejection-submit-btn"
                disabled={isSubmitting}
                style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#EF4444', borderColor: '#EF4444' }}
              >
                {isSubmitting ? 'Cancelling...' : 'Cancel Schedule'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
