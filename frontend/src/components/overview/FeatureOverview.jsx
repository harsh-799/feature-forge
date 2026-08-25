import React from 'react';

export default function FeatureOverview({ featureOverviewMetrics }) {
  return (
    <div className="feature-overview-section">
      <div className="feature-overview-header">
        <h2 className="feature-overview-title">Feature Overview</h2>
        <p className="feature-overview-desc">Key metrics across active feature flags and deployment environments</p>
      </div>

      <div className="feature-overview-grid">
        {featureOverviewMetrics.map((item, idx) => (
          <div key={idx} className="feature-overview-card">
            <div className="feature-card-top">
              <span className="feature-card-top-icon">{item.icon}</span>
              <span className="feature-card-top-label">{item.label}</span>
            </div>
            <div className="feature-card-middle">
              <span className="feature-card-value">{item.value}</span>
            </div>
            <div className="feature-card-bottom">
              {item.subcaption}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
