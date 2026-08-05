import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom'
import { FiArrowLeft, FiEdit3, FiCheckCircle, FiActivity, FiAlertTriangle, FiSliders, FiCalendar, FiLock } from 'react-icons/fi'
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
  deactivateFeatureProduction
} from '../../api/featureApi'
import { getErrorMessage } from '../../api/authApi'
import { toast } from 'react-toastify'
import './FeatureDetails.css'

export default function FeatureDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentWorkspaceId, role } = useOutletContext(); // Workspace authority

  const [feature, setFeature] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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

  // Authority flags
  const isAdminOrDev = role === 'ADMIN' || role === 'DEVELOPER';
  const isQA = role === 'QA';
  const isAdmin = role === 'ADMIN';

  const loadFeatureDetails = async () => {
    if (!id || !currentWorkspaceId) return;

    setIsLoading(true);
    const startTime = Date.now();
    try {
      const data = await getFeatureDetails(id, currentWorkspaceId);
      
      // Enforce a minimum loader duration of 350ms to prevent skeleton screen flashing/flicker
      const elapsed = Date.now() - startTime;
      const minDelay = 350;
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }

      setFeature(data);
      setEditName(data.name);
      setEditDesc(data.description || '');

      // Load active production rollout value
      const prodConfig = data.environments.find(e => e.environmentName === 'PRODUCTION');
      if (prodConfig && prodConfig.rolloutPercentage !== null) {
        setRolloutVal(prodConfig.rolloutPercentage);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      navigate('/app/features');
    } finally {
      setIsLoading(false);
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
      await updateFeature(id, {
        name: editName.trim(),
        description: editDesc.trim() || null,
        workspaceId: currentWorkspaceId
      });
      toast.success('Feature details updated successfully!');
      setIsEditing(false);
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
      loadFeatureDetails();
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
      loadFeatureDetails();
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
      loadFeatureDetails();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsSavingRollout(false);
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

  const devConfig = feature.environments.find(e => e.environmentName === 'DEVELOPMENT');
  const stagingConfig = feature.environments.find(e => e.environmentName === 'STAGING');
  const prodConfig = feature.environments.find(e => e.environmentName === 'PRODUCTION');

  return (
    <div className="flag-details-container">
      <Link to="/app/features" className="back-nav-link">
        <FiArrowLeft style={{ marginRight: '6px' }} /> Back to Feature Flags
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

            <div className={`timeline-step ${
              feature.status === 'READY_FOR_QA' || feature.status === 'QA_VERIFIED' || feature.status === 'QA_REJECTED' || feature.status === 'IN_PRODUCTION'
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
          {/* Flag Info */}
          <div className="details-section-card">
            <div className="card-header-with-action">
              <h3>Flag Information</h3>
              {feature.status === 'IN_DEVELOPMENT' && isAdminOrDev && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="inline-edit-btn">
                  <FiEdit3 size={13} style={{ marginRight: '6px' }} /> Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="inline-edit-form">
                <div className="edit-form-group">
                  <label htmlFor="editName" className="edit-form-label">FEATURE NAME</label>
                  <input
                    type="text"
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="edit-form-input"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="edit-form-group">
                  <label htmlFor="editDesc" className="edit-form-label">DESCRIPTION</label>
                  <textarea
                    id="editDesc"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="edit-form-textarea"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="edit-form-actions">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="edit-cancel-btn"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="edit-save-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flag-details-info-display">
                <div className="info-display-item">
                  <div className="info-label">DESCRIPTION</div>
                  <div className="info-value">
                    {feature.description || <span className="muted-italic">No description provided.</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Env states */}
          <div className="details-section-card">
            <h3>Environment Configurations</h3>
            
            <div className="env-configs-stack">
              <div className="env-config-row">
                <div className="env-row-left">
                  <div className="env-row-status-dot dev"></div>
                  <div>
                    <span className="env-row-name">DEVELOPMENT</span>
                    <span className="env-row-desc">Evaluates to true during development lifecycle.</span>
                  </div>
                </div>
                <div className="env-row-right">
                  <span className={`env-state-label ${devConfig?.isEnabled ? 'enabled' : 'disabled'}`}>
                    {devConfig?.isEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              </div>

              <div className="env-config-row">
                <div className="env-row-left">
                  <div className="env-row-status-dot staging"></div>
                  <div>
                    <span className="env-row-name">STAGING</span>
                    <span className="env-row-desc">Automatically active when promoted for QA testing.</span>
                  </div>
                </div>
                <div className="env-row-right">
                  <span className={`env-state-label ${stagingConfig?.isEnabled ? 'enabled' : 'disabled'}`}>
                    {stagingConfig?.isEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              </div>

              <div className="env-config-row">
                <div className="env-row-left">
                  <div className="env-row-status-dot production"></div>
                  <div>
                    <span className="env-row-name">PRODUCTION</span>
                    <span className="env-row-desc">Serves real customer traffic using rollout target.</span>
                  </div>
                </div>
                <div className="env-row-right">
                  <span className={`env-state-label ${prodConfig?.isEnabled ? 'enabled' : 'disabled'}`}>
                    {prodConfig?.isEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
                    <FiLock size={14} style={{ marginRight: '6px' }} />
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
                {/* Activation Switch */}
                <div className="production-toggle-section">
                  <div className="toggle-label-group">
                    <h4>Production Release State</h4>
                    <p>Control whether this flag is evaluated to true in the production environment.</p>
                  </div>

                  {isAdmin ? (
                    prodConfig?.isEnabled ? (
                      <button
                        onClick={handleDeactivateProduction}
                        className="production-state-toggle-btn active"
                        disabled={isSubmitting}
                      >
                        Deactivate Flag
                      </button>
                    ) : isActivating ? (
                      <form onSubmit={handleActivateProduction} className="activation-form">
                        <div className="activation-form-group">
                          <label htmlFor="initialRollout" className="activation-label">INITIAL ROLLOUT TARGET</label>
                          <div className="activation-input-row">
                            <input
                              type="range"
                              id="initialRollout"
                              min="1"
                              max="100"
                              value={actRollout}
                              onChange={(e) => setActRollout(parseInt(e.target.value))}
                              className="rollout-slider-range"
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
                            className="rejection-submit-btn"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Activating...' : 'Activate Flag'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsActivating(true)}
                        className="production-state-toggle-btn inactive"
                        disabled={isSubmitting}
                      >
                        Activate Flag
                      </button>
                    )
                  ) : (
                    <div className="locked-action-overlay">
                      <FiLock size={14} style={{ marginRight: '6px' }} />
                      <span>Production release toggles require Admin authority.</span>
                    </div>
                  )}
                </div>

                {/* Percentage Rollout Slider */}
                {prodConfig?.isEnabled && (
                  <div className="production-rollout-section">
                    <div className="rollout-section-header">
                      <div>
                        <h4>Percentage Rollout Configuration</h4>
                        <p>Incrementally release this feature flag to a segment of your audience.</p>
                      </div>
                      <span className="rollout-value-text">{rolloutVal}%</span>
                    </div>

                    <div className="rollout-slider-track-container">
                      <span className="slider-bound">0%</span>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={rolloutVal}
                        onChange={(e) => setRolloutVal(parseInt(e.target.value))}
                        className="rollout-slider-range"
                        disabled={isSavingRollout || !isAdmin}
                      />
                      <span className="slider-bound">100%</span>
                    </div>

                    {isAdmin ? (
                      rolloutVal !== prodConfig.rolloutPercentage && (
                        <button
                          onClick={handleSaveRollout}
                          className="save-rollout-btn"
                          disabled={isSavingRollout}
                        >
                          {isSavingRollout ? 'Saving rollout...' : 'Save Rollout Percentage'}
                        </button>
                      )
                    ) : (
                      <div className="locked-action-overlay" style={{ marginTop: '12px' }}>
                        <FiLock size={14} style={{ marginRight: '6px' }} />
                        <span>Adjusting rollout percentages requires Admin authority.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
