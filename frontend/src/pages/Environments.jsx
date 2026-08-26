import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useOutletContext } from 'react-router-dom'
import { FiX, FiAlertTriangle } from 'react-icons/fi'
import { regenerateApiKey } from '../api/workspaceApi'
import { getErrorMessage } from '../api/authApi'
import { toast } from 'react-toastify'
import EnvironmentCard from '../components/environments/EnvironmentCard'
import './Environments.css'

export default function Environments() {
  const context = useOutletContext() || {};
  const currentWorkspaceId = context.currentWorkspaceId;
  const userRole = (context.role || localStorage.getItem('currentWorkspaceRole') || localStorage.getItem('currentUserWorkspaceRole') || '').toUpperCase();
  const isAdmin = userRole === 'ADMIN';
  
  // State for newly regenerated API keys (in-memory only for one-time reveal, NOT in localStorage)
  const [freshKeys, setFreshKeys] = useState({}); // { STAGING: 'ff_abc...' }
  const [confirmEnv, setConfirmEnv] = useState(null); // { name: 'STAGING', label: 'Staging' }
  const [loadingEnv, setLoadingEnv] = useState(null); // 'STAGING'

  const environmentsList = [
    {
      name: 'DEVELOPMENT',
      label: 'Development',
      description: 'Used for local developer sandboxes and integration testing.',
      color: '#3B82F6'
    },
    {
      name: 'STAGING',
      label: 'Staging',
      description: 'Matches production data. Used by QA engineers for acceptance testing.',
      color: '#F59E0B'
    },
    {
      name: 'PRODUCTION',
      label: 'Production',
      description: 'Real production customer traffic. Serves evaluated targeting rules.',
      color: '#10B981'
    }
  ];

  const handleConfirmRegenerate = async () => {
    if (!confirmEnv || !currentWorkspaceId || loadingEnv) return;
    const targetEnv = confirmEnv;
    setConfirmEnv(null); // Close modal immediately
    setLoadingEnv(targetEnv.name);

    try {
      const response = await regenerateApiKey(currentWorkspaceId, { environmentName: targetEnv.name });
      if (response && response.success && response.apiKey) {
        // Set the one-time revealed plaintext key for this environment
        setFreshKeys(prev => ({
          ...prev,
          [targetEnv.name]: response.apiKey
        }));
        toast.success(response.message || `Successfully regenerated API key for ${targetEnv.label}`);
      } else {
        toast.error(response?.message || 'Failed to regenerate API key.');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setLoadingEnv(null);
    }
  };

  const handleCopyFreshKey = async (envName, envLabel, keyVal) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(keyVal);
      }
    } catch (e) {
      console.error('Clipboard copy error:', e);
    }
    toast.success('API key copied to clipboard.');
    
    // Immediately hide/mask the API key again and return card to normal state
    setFreshKeys(prev => {
      const updated = { ...prev };
      delete updated[envName];
      return updated;
    });
  };

  return (
    <div className="environments-page-container">
      {/* Header */}
      <header className="environments-header-group page-header-group">
        <span className="environments-header-badge">ENVIRONMENTS</span>
        <h1 className="environments-header-title page-header-title">Project Environments</h1>
        <p className="environments-header-desc page-header-description">
          Manage client keys for your release pipeline. Each environment uses a unique key to evaluate feature flags.
        </p>
      </header>

      {/* Grid matching Feature Flags list (.features-grid-list) */}
      <div className="environments-grid-list">
        {environmentsList.map((env) => (
          <EnvironmentCard
            key={env.name}
            env={env}
            isAdmin={isAdmin}
            freshKey={freshKeys[env.name]}
            isThisLoading={loadingEnv === env.name}
            handleCopyFreshKey={handleCopyFreshKey}
            setConfirmEnv={setConfirmEnv}
          />
        ))}
      </div>

      {/* Confirmation Modal rendered via portal to cover entire viewport */}
      {confirmEnv && createPortal(
        <div className="modal-overlay" onClick={() => setConfirmEnv(null)}>
          <div className="modal-card env-modal-compact" onClick={e => e.stopPropagation()}>
            
            {/* Top Header Row */}
            <div className="env-modal-header-row">
              <div className="env-modal-header-title-group">
                <div className="env-modal-icon-badge">
                  <FiAlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="env-modal-title">
                    Regenerate API Key
                  </h3>
                  <div className="env-modal-subtitle-row">
                    <span className="env-modal-badge-dot" style={{ backgroundColor: confirmEnv.color }} />
                    <span className="env-modal-badge-text">
                      {confirmEnv.label} Environment
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setConfirmEnv(null)}
                aria-label="Close"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Warning Callout Box */}
            <div className="env-modal-warning-box">
              <p className="env-modal-warning-title">
                Are you sure you want to proceed?
              </p>
              <p className="env-modal-warning-desc">
                The current API key will be immediately revoked. Any SDKs or applications using the old key will stop working until updated with the new key.
              </p>
            </div>

            {/* Footer Action Row */}
            <div className="modal-footer-actions">
              <button
                type="button"
                onClick={() => setConfirmEnv(null)}
                className="modal-cancel-btn"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRegenerate}
                className="modal-destructive-btn"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
