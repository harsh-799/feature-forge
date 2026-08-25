import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

export default function PendingApprovals({ pendingQAFeatures }) {
  return (
    <div className="dashboard-panel-card">
      <div>
        <div className="panel-header">
          <h3 className="panel-title">Pending QA Approvals</h3>
          <p className="panel-subtitle">Features waiting for QA review</p>
        </div>
        <div className="panel-content">
          {pendingQAFeatures.length === 0 ? (
            <div className="panel-empty-state-container">
              <div className="panel-empty-icon-circle">
                <FiCheckCircle size={22} />
              </div>
              <h4 className="panel-empty-main-msg">All caught up</h4>
              <p className="panel-empty-sub-msg">No features are currently waiting for QA approval.</p>
            </div>
          ) : (
            <div className="pending-approvals-list">
              {pendingQAFeatures.map((item) => (
                <div key={item.id} className="approval-row-item">
                  <div className="approval-item-info">
                    <span className="approval-item-name">{item.name}</span>
                    <span className="status-badge-staging">{item.status}</span>
                  </div>
                  <Link to={`/app/features/${item.id}`} className="panel-action-link">
                    Review →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="panel-footer">
        <Link to="/app/features" className="panel-action-link">
          {pendingQAFeatures.length === 0 ? 'View feature flags →' : 'View all approvals →'}
        </Link>
      </div>
    </div>
  );
}
