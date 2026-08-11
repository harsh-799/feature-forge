import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'

export default function FeatureDetails() {
  const { id } = useParams();

  const environments = [
    { name: 'DEVELOPMENT', status: 'Enabled', key: 'dev-status' },
    { name: 'STAGING', status: 'Disabled', key: 'staging-status' },
    { name: 'PRODUCTION', status: 'Disabled', key: 'prod-status' }
  ];

  return (
    <div className="feature-details-page" style={{ fontFamily: 'var(--sans)', textAlign: 'left' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/app/features" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          textDecoration: 'none'
        }}>
          <FiArrowLeft size={16} /> Back to Feature Flags
        </Link>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>FEATURE KEY: {id}</span>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '4px', letterSpacing: '-0.02em' }}>
          Manage Feature Flag
        </h1>
      </div>

      {/* Target Status Panel */}
      <div className="env-status-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {environments.map((e, idx) => (
          <div key={idx} style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)'
          }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', opacity: 0.6, letterSpacing: '0.05em' }}>
              {e.name}
            </h3>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '16px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '16px'
            }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-heading)' }}>Status</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: e.status === 'Enabled' ? '#2F9254' : '#88867f',
                backgroundColor: e.status === 'Enabled' ? '#EBF7EE' : '#FAF8F3',
                padding: '4px 10px',
                borderRadius: '99px',
                border: `1px solid ${e.status === 'Enabled' ? 'rgba(47, 146, 84, 0.2)' : 'var(--border-color)'}`
              }}>
                {e.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
