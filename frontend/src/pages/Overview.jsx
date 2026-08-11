import { useOutletContext } from 'react-router-dom'
import { FiGrid, FiToggleLeft, FiLayers, FiClock } from 'react-icons/fi'

export default function Overview() {
  const { currentWorkspaceName } = useOutletContext();

  const metrics = [
    { label: 'Feature Flags', value: '4 active', icon: <FiToggleLeft size={20} className="icon-blue" /> },
    { label: 'Environments', value: '3 configured', icon: <FiLayers size={20} className="icon-green" /> },
    { label: 'Activity Logs', value: '12 entries', icon: <FiClock size={20} className="icon-orange" /> }
  ];

  return (
    <div className="overview-page" style={{ fontFamily: 'var(--sans)', textAlign: 'left' }}>
      <div className="overview-header" style={{ marginBottom: '32px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>WORKSPACE OVERVIEW</span>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '4px', letterSpacing: '-0.02em' }}>
          {currentWorkspaceName || 'Workspace'}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '8px', opacity: 0.8 }}>
          Manage environments, feature flag keys, and access logs for this project workspace.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {metrics.map((m, idx) => (
          <div key={idx} className="metric-card" style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)'
          }}>
            <div className="metric-icon-box" style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#FAF8F3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {m.icon}
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', opacity: 0.6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {m.label}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '4px' }}>
                {m.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Setup Card */}
      <div className="setup-card" style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '8px' }}>
          Connect FeatureForge to your codebase
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '20px', maxWidth: '600px' }}>
          To start checking flags at runtime, use the Environment API keys configured under the Environments page and import the Java SDK client directly into your microservices.
        </p>
        <a href="/app/environments" style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: 'var(--charcoal)',
          color: '#FFFFFF',
          padding: '10px 20px',
          borderRadius: '30px',
          fontSize: '13.5px',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'transform 0.2s'
        }}>
          View API Keys →
        </a>
      </div>
    </div>
  )
}
