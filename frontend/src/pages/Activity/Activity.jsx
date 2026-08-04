import React from 'react'
import { FiClock } from 'react-icons/fi'
import './Activity.css'

export default function Activity() {
  return (
    <div className="activity-page-wrapper">
      {/* Visual Identity Heading Hierarchy */}
      <header className="page-header-group">
        <h1 className="page-header-title">Activity</h1>
        <p className="page-header-description">
          Track changes made across your workspace.
        </p>
      </header>

      {/* Polished Empty State Card */}
      <div className="coming-soon-card">
        <div className="coming-soon-icon-container">
          <FiClock size={24} style={{ color: 'var(--text-primary)', opacity: 0.8 }} />
        </div>
        <h3>Activity timeline coming soon</h3>
        <p>
          Audit logs, environment status transitions, flag modifications, and workspace invite histories will be logged here.
        </p>
        <div className="coming-soon-decoration">
          <div className="coming-soon-line"></div>
          <div className="coming-soon-line short"></div>
        </div>
      </div>
    </div>
  );
}
