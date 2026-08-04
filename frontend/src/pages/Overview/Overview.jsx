import React from 'react'
import { FiTrendingUp } from 'react-icons/fi'
import './Overview.css'

export default function Overview() {
  return (
    <div className="overview-page-wrapper">
      {/* Visual Identity Heading Hierarchy */}
      <header className="page-header-group">
        <h1 className="page-header-title">Overview</h1>
        <p className="page-header-description">
          Monitor workspace health, flag evaluations, and active release analytics.
        </p>
      </header>

      {/* Polished Empty State Card */}
      <div className="coming-soon-card">
        <div className="coming-soon-icon-container">
          <FiTrendingUp size={24} style={{ color: 'var(--text-primary)', opacity: 0.8 }} />
        </div>
        <h3>Analytics Dashboard coming soon</h3>
        <p>
          Once you integrate our SDK into your codebase, live telemetry, evaluation metrics, and active project KPI charts will appear here.
        </p>
        <div className="coming-soon-decoration">
          <div className="coming-soon-line"></div>
          <div className="coming-soon-line short"></div>
        </div>
      </div>
    </div>
  );
}
