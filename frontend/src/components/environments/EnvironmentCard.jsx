import React from 'react';
import { FiKey, FiRefreshCw, FiAlertTriangle, FiCopy } from 'react-icons/fi';

export default function EnvironmentCard({
  env,
  isAdmin,
  freshKey,
  isThisLoading,
  handleCopyFreshKey,
  setConfirmEnv
}) {
  const displayKey = freshKey || 'ff_••••••••••••••••••••••••••••••••';

  return (
    <div className="environment-item-card">
      <div className="env-card-top">
        {/* Card header */}
        <div className="env-card-headline">
          <div className="env-card-title-group">
            <span className="env-color-dot" style={{ backgroundColor: env.color }} />
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
            <FiAlertTriangle size={13} className="env-icon-shrink" />
            <span>Copy this key now. It will be hidden after copying.</span>
          </div>
        )}

        {/* Regenerate API Key Action Button - Only rendered for ADMIN role */}
        {isAdmin && (
          <div className="env-btn-row-right">
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
}
