import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

export default function PendingApprovals({ activeRole }) {
  if (!activeRole) {
    return (
      <div className="dashboard-panel-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-primary)', opacity: 0.6 }}>Loading panel...</span>
      </div>
    );
  }

  let title = 'Pending QA Approvals';
  let subtitle = 'Features waiting for QA review';
  let emptyText = 'No features are currently waiting for QA approval.';
  let featuresList = [];

  if (activeRole === 'ADMIN') {
    title = 'Pending QA Approvals';
    subtitle = 'Features waiting for QA review';
    emptyText = 'No features are currently waiting for QA approval.';
    featuresList = [
      { id: '1', name: 'user-onboarding-v2', status: 'STAGING', actionText: 'Review →' },
      { id: '2', name: 'payment-gateway-stripe', status: 'STAGING', actionText: 'Review →' }
    ];
  } else if (activeRole === 'QA') {
    title = 'Pending QA Reviews';
    subtitle = 'Features awaiting your review';
    emptyText = 'No features are currently waiting for QA approval.';
    featuresList = [
      { id: '3', name: 'checkout-retry-logic', status: 'STAGING', actionText: 'Review →' },
      { id: '4', name: 'payment-gateway-v2', status: 'STAGING', actionText: 'Review →' }
    ];
  } else if (activeRole === 'DEVELOPER') {
    title = 'My Flags';
    subtitle = 'Flags you own that need action';
    emptyText = 'No flags need your attention.';
    featuresList = [
      { id: '5', name: 'checkout-retry-logic', status: 'DRAFT', actionText: 'Submit for QA →' },
      { id: '6', name: 'dark-mode-toggle', status: 'REJECTED', actionText: 'View feedback →' }
    ];
  }

  return (
    <div className="dashboard-panel-card">
      <div>
        <div className="panel-header">
          <h3 className="panel-title">{title}</h3>
          <p className="panel-subtitle">{subtitle}</p>
        </div>
        <div className="panel-content">
          {featuresList.length === 0 ? (
            <div className="panel-empty-state-container">
              <div className="panel-empty-icon-circle">
                <FiCheckCircle size={22} />
              </div>
              <h4 className="panel-empty-main-msg">All caught up</h4>
              <p className="panel-empty-sub-msg">{emptyText}</p>
            </div>
          ) : (
            <div className="pending-approvals-list">
              {featuresList.map((item) => {
                let statusClass = 'status-badge-staging';
                if (item.status === 'DRAFT') {
                  statusClass = 'status-badge-draft';
                } else if (item.status === 'REJECTED') {
                  statusClass = 'status-badge-rejected';
                }

                return (
                  <div key={item.id} className="approval-row-item">
                    <div className="approval-item-info">
                      <span className="approval-item-name">{item.name}</span>
                      <span className={statusClass}>{item.status}</span>
                    </div>
                    <Link to={`/app/features/${item.id}`} className="panel-action-link">
                      {item.actionText}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="panel-footer">
        <Link to="/app/features" className="panel-action-link">
          {featuresList.length === 0 ? 'View feature flags →' : (activeRole === 'DEVELOPER' ? 'View feature flags →' : 'View all approvals →')}
        </Link>
      </div>
    </div>
  );
}
