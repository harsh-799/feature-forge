import { useOutletContext, Link } from 'react-router-dom'
import { FiGrid, FiToggleLeft, FiLayers, FiClock } from 'react-icons/fi'
import './Overview.css'

export default function Overview() {
  const { currentWorkspaceName } = useOutletContext();

  const metrics = [
    { label: 'Feature Flags', value: '4 active', icon: <FiToggleLeft size={20} className="icon-blue" /> },
    { label: 'Environments', value: '3 configured', icon: <FiLayers size={20} className="icon-green" /> },
    { label: 'Activity Logs', value: '12 entries', icon: <FiClock size={20} className="icon-orange" /> }
  ];

  return (
    <div className="overview-page">
      <div className="overview-header">
        <span className="overview-badge">WORKSPACE OVERVIEW</span>
        <h1 className="overview-title">
          {currentWorkspaceName || 'Workspace'}
        </h1>
        <p className="overview-desc">
          Manage environments, feature flag keys, and access logs for this project workspace.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        {metrics.map((m, idx) => (
          <div key={idx} className="metric-card">
            <div className="metric-icon-box">
              {m.icon}
            </div>
            <div>
              <div className="metric-label">
                {m.label}
              </div>
              <div className="metric-value">
                {m.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Setup Card */}
      <div className="setup-card">
        <h2 className="setup-title">
          Connect FeatureForge to your codebase
        </h2>
        <p className="setup-desc">
          To start checking flags at runtime, use the Environment API keys configured under the Environments page and import the Java SDK client directly into your microservices.
        </p>
        <Link to="/app/environments" className="setup-action-btn">
          View API Keys →
        </Link>
      </div>
    </div>
  )
}
