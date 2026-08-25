import { useOutletContext, Link } from 'react-router-dom'
import { FiGrid, FiToggleLeft, FiLayers, FiClock, FiToggleRight, FiCode, FiGitPullRequest, FiCheckCircle } from 'react-icons/fi'
import './Overview.css'

export default function Overview() {
  const { currentWorkspaceName } = useOutletContext();

  const featureOverviewMetrics = [
    {
      label: 'Active Features',
      value: '12',
      subcaption: 'vs previous month',
      icon: <FiToggleRight size={18} />
    },
    {
      label: 'Development',
      value: '4',
      subcaption: 'flags currently in draft',
      icon: <FiCode size={18} />
    },
    {
      label: 'Staging',
      value: '6',
      subcaption: 'flags undergoing testing',
      icon: <FiGitPullRequest size={18} />
    },
    {
      label: 'Production',
      value: '8',
      subcaption: 'live flags serving traffic',
      icon: <FiCheckCircle size={18} />
    }
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

      {/* Feature Overview Section */}
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
