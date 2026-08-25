import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useOutletContext } from 'react-router-dom'
import { FiKey, FiRefreshCw, FiX, FiAlertTriangle, FiCopy } from 'react-icons/fi'
import { regenerateApiKey } from '../api/workspaceApi'
import { getErrorMessage } from '../api/authApi'
import { toast } from 'react-toastify'
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
        {environmentsList.map((env) => {
          const freshKey = freshKeys[env.name];
          const displayKey = freshKey || 'ff_••••••••••••••••••••••••••••••••';
          const isThisLoading = loadingEnv === env.name;

          return (
            <div key={env.name} className="environment-item-card">
              <div className="env-card-top">
                {/* Card header */}
                <div className="env-card-headline">
                  <div className="env-card-title-group">
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: env.color, flexShrink: 0 }} />
                    <h3>{env.label}</h3>
                  </div>
                  <span className="env-card-status-pill">Active</span>
                </div>

                {/* Description */}
                <p className="env-card-description">{env.description}</p>
              </div>

              {/* Key display section */}
              <div className="env-card-bottom">
                <div className="env-key-section-label">
                  <FiKey size={12} />
                  <span>SDK CLIENT API KEY</span>
                </div>

                <div className={`env-key-input-box ${freshKey ? 'fresh-active' : ''}`}>
                  <code className={`env-key-code ${freshKey ? 'fresh-text' : ''}`}>
                    {displayKey}
                  </code>

                  {freshKey && (
                    <button
                      type="button"
                      className="env-copy-icon-btn"
                      onClick={() => handleCopyFreshKey(env.name, env.label, freshKey)}
                      title="Copy API Key"
                    >
                      <FiCopy size={15} />
                    </button>
                  )}
                </div>

                {freshKey && (
                  <div className="env-fresh-warning-note">
                    <FiAlertTriangle size={13} style={{ flexShrink: 0 }} />
                    <span>Copy this key now. It will be hidden after copying.</span>
                  </div>
                )}

                {/* Regenerate API Key Action Button - Only rendered for ADMIN role */}
                {isAdmin && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="env-regenerate-action-btn"
                      onClick={() => setConfirmEnv(env)}
                      disabled={isThisLoading}
                    >
                      <FiRefreshCw size={13} className={isThisLoading ? 'spin-icon' : ''} />
                      <span>{isThisLoading ? 'Regenerating...' : 'Regenerate API Key'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal rendered via portal to cover entire viewport */}
      {confirmEnv && createPortal(
        <div className="modal-overlay" onClick={() => setConfirmEnv(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px', padding: '28px' }}>
            
            {/* Top Header Row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FiAlertTriangle size={20} color="#D97706" />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.01em' }}>
                    Regenerate API Key
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: confirmEnv.color }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', opacity: 0.8 }}>
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
            <div style={{
              backgroundColor: '#FAF8F3',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '22px'
            }}>
              <p style={{ fontSize: '13px', color: 'var(--text-heading)', fontWeight: 600, margin: '0 0 6px 0' }}>
                Are you sure you want to proceed?
              </p>
              <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
                The current API key will be immediately revoked. Any SDKs or applications using the old key will stop working until updated with the new key.
              </p>
            </div>

            {/* Footer Action Row */}
            <div style={{
              display: 'flex',
              justify: 'flex-end',
              gap: '10px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '18px'
            }}>
              <button
                type="button"
                onClick={() => setConfirmEnv(null)}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '9px 18px',
                  borderRadius: '30px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRegenerate}
                style={{
                  backgroundColor: 'var(--charcoal)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '30px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  boxShadow: '0 4px 12px rgba(38, 37, 33, 0.15)',
                  transition: 'all 0.15s ease'
                }}
              >
                <FiRefreshCw size={13} />
                <span>Regenerate Key</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
