import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiPlus, FiMail } from 'react-icons/fi'

export default function WorkspaceMembers() {
  const [email, setEmail] = useState('');

  const members = [
    { email: 'developer@featureforge.com', role: 'ADMIN', status: 'ACTIVE' }
  ];

  const handleInvite = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <div className="members-page" style={{ fontFamily: 'var(--sans)', textAlign: 'left', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/app/overview" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          textDecoration: 'none'
        }}>
          <FiArrowLeft size={16} /> Back to Overview
        </Link>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>WORKSPACE MEMBERS</span>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '4px', letterSpacing: '-0.02em' }}>
          Manage Members
        </h1>
      </div>

      {/* Invite Member form */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
        marginBottom: '32px'
      }}>
        <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '16px' }}>Invite Collaborator</h3>
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <FiMail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-primary)', opacity: 0.6 }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collaborator@domain.com"
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                borderRadius: '30px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontFamily: 'var(--sans)',
                fontSize: '13.5px'
              }}
            />
          </div>
          <button type="submit" style={{
            backgroundColor: 'var(--charcoal)',
            color: '#FFFFFF',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '30px',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Send Invitation
          </button>
        </form>
      </div>

      {/* Members list */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#FAF8F3', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', opacity: 0.6 }}>MEMBER EMAIL</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', opacity: 0.6 }}>ROLE</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', opacity: 0.6 }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, idx) => (
              <tr key={idx}>
                <td style={{ padding: '18px 24px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-heading)' }}>{m.email}</td>
                <td style={{ padding: '18px 24px', fontSize: '12px', color: 'var(--text-primary)' }}>{m.role}</td>
                <td style={{ padding: '18px 24px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#2F9254', backgroundColor: '#EBF7EE', padding: '3px 8px', borderRadius: '4px' }}>
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
