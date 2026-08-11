import { FiClock, FiUser } from 'react-icons/fi'

export default function Activity() {
  const logs = [
    { action: 'Created Workspace', user: 'you@domain.com', details: 'Initialized project environment keys.', date: 'Just now' },
    { action: 'Created Feature Flag', user: 'you@domain.com', details: 'Registered key beta-targeting-rules.', date: '10 minutes ago' }
  ];

  return (
    <div className="activity-page" style={{ fontFamily: 'var(--sans)', textAlign: 'left' }}>
      <div className="activity-header" style={{ marginBottom: '32px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>ACTIVITY LOGS</span>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '4px', letterSpacing: '-0.02em' }}>
          Audit Trail
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '8px', opacity: 0.8 }}>
          View history of modifications, target revisions, status updates, and workspace configuration changes.
        </p>
      </div>

      {/* Timeline Wrapper */}
      <div className="activity-timeline" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {logs.map((log, idx) => (
          <div key={idx} style={{
            display: 'flex',
            gap: '16px',
            position: 'relative'
          }}>
            {/* Timeline icon */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#FAF8F3',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FiClock size={14} style={{ color: 'var(--accent)' }} />
            </div>

            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px 20px',
              flex: 1,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)' }}>{log.action}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-primary)', opacity: 0.6 }}>{log.date}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', opacity: 0.8, marginBottom: '6px' }}>{log.details}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-primary)', opacity: 0.7 }}>
                <FiUser size={12} /> {log.user}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
