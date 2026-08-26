import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiCalendar, FiInbox } from 'react-icons/fi';

export default function FeatureList({
  features,
  isLoading,
  canCreate,
  handleToggle,
  debouncedKeyword,
  keyword,
  statusFilter
}) {
  const getFeatureKey = (feature) => {
    if (feature.key) return feature.key;
    return (feature.name || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_');
  };

  const getStatusLabelClass = (status) => {
    switch (status) {
      case 'IN_DEVELOPMENT': return 'status-dev';
      case 'READY_FOR_QA': return 'status-qa';
      case 'QA_VERIFIED': return 'status-qa-verified';
      case 'QA_REJECTED': return 'status-qa-rejected';
      case 'IN_PRODUCTION': return 'status-prod';
      default: return 'status-default';
    }
  };

  const formatStatusText = (status) => {
    return status ? status.replace(/_/g, ' ') : '';
  };

  if (isLoading) {
    return (
      <div className="features-grid-list loading">
        {[1, 2, 3].map((n) => (
          <div key={n} className="feature-card-skeleton pulse">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line desc"></div>
            <div className="skeleton-line meta"></div>
          </div>
        ))}
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="features-empty-state">
        <div className="empty-state-icon-circle">
          <FiInbox size={24} />
        </div>
        <h3>No feature flags found</h3>
        <p>
          {(debouncedKeyword || keyword || statusFilter)
            ? 'No feature flags match your search query or filters. Clear your filters to view all flags.'
            : 'Create your first feature flag to start managing code deployments independently from feature releases.'}
        </p>
        {!(debouncedKeyword || keyword || statusFilter) && canCreate && (
          <Link to="/app/features/new" className="empty-state-create-btn">
            <FiPlus className="btn-icon-space" /> Create Your First Flag
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="features-grid-list">
      {features.map((feature) => {
        const isEnabled = feature.isEnabled || false;

        return (
          <div key={feature.featureId} className="feature-item-card">
            <div className="feature-card-main-info">
              {/* Top Row: Name and Lifecycle Status */}
              <div className="feature-card-headline">
                <h3>{feature.name}</h3>
                <span className={`status-pill-badge ${getStatusLabelClass(feature.status)}`}>
                  {formatStatusText(feature.status)}
                </span>
              </div>

              {/* Sub-name row: Flag Key Badge */}
              <div className="card-key-wrapper">
                <code className="feature-card-key-code">{getFeatureKey(feature)}</code>
              </div>

              {/* Toggle row: Blinking Dot Active/Inactive Status and Toggle Switch */}
              <div className="card-toggle-row">
                <div className={`card-active-indicator ${isEnabled ? 'active' : ''}`}>
                  <div className={isEnabled ? 'blinking-dot' : 'inactive-dot'}></div>
                  <span>{isEnabled ? 'Active' : 'Inactive'}</span>
                </div>

                <div className="card-toggle-wrapper">
                  <span className={`card-toggle-label-outer ${isEnabled ? 'on' : 'off'}`}>
                    {isEnabled ? 'ON' : 'OFF'}
                  </span>
                  <button
                    onClick={() => handleToggle(feature)}
                    className={`card-toggle-pill ${isEnabled ? 'on' : 'off'}`}
                  >
                    <div className="card-toggle-thumb"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Row: Created Date and Manage Button */}
            <div className="feature-card-footer">
              <div className="feature-card-date-meta">
                <FiCalendar size={13} className="btn-icon-space" />
                <span>Created {new Date(feature.createdAt).toLocaleDateString()}</span>
              </div>
              <Link
                to={`/app/features/${feature.featureId}`}
                className="feature-card-manage-link"
              >
                Manage
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
