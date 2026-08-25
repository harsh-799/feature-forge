import React from 'react';
import { Link } from 'react-router-dom';

export default function RecentActivity({ recentActivities }) {
  return (
    <div className="dashboard-panel-card">
      <div>
        <div className="panel-header">
          <h3 className="panel-title">Recent Activity</h3>
          <p className="panel-subtitle">Workspace history and audit trail</p>
        </div>
        <div className="panel-content">
          {recentActivities.length === 0 ? (
            <div className="panel-empty-state">No recent activity.</div>
          ) : (
            <div className="recent-activity-list">
              {recentActivities.map((act, idx) => (
                <div key={idx} className="activity-row-item">
                  <div className="activity-item-main">
                    <span className="activity-item-title">{act.title}</span>
                    <span className="activity-item-desc">{act.description}</span>
                  </div>
                  <span className="activity-item-time">{act.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="panel-footer">
        <Link to="/app/activity" className="panel-action-link">
          View activity →
        </Link>
      </div>
    </div>
  );
}
