import React from 'react';
import { FiChevronDown, FiMail } from 'react-icons/fi';

export default function InviteCollaborator({
  inviteOpen,
  setInviteOpen,
  email,
  setEmail,
  inviteRole,
  setInviteRole,
  isSubmitting,
  handleInvite
}) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
      marginBottom: '20px',
      overflow: 'hidden'
    }}>
      <div
        className={`invite-header${inviteOpen ? ' open' : ''}`}
        onClick={() => setInviteOpen(p => !p)}
        role="button"
        aria-expanded={inviteOpen}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
          Invite Collaborator
        </h3>
        <FiChevronDown size={16} className={`invite-chevron${inviteOpen ? ' open' : ''}`} />
      </div>
      <div className={`invite-body${inviteOpen ? ' open' : ''}`}>
        <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '18px 20px' }}>
          <div style={{ flex: '1 1 180px', minWidth: 0, position: 'relative' }}>
            <FiMail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-primary)', opacity: 0.55 }} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="collaborator@domain.com"
              disabled={isSubmitting}
              style={{
                width: '100%', padding: '10px 12px 10px 38px',
                borderRadius: '30px', border: '1px solid var(--border-color)',
                outline: 'none', fontFamily: 'var(--sans)', fontSize: '13px',
                backgroundColor: '#FAF8F3',
                transition: 'border-color 0.2s ease, background-color 0.2s ease'
              }}
            />
          </div>
          <select
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value)}
            disabled={isSubmitting}
            className="members-role-select"
            style={{ minWidth: '130px' }}
          >
            <option value="DEVELOPER">Developer</option>
            <option value="QA">QA</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" disabled={isSubmitting} style={{
            backgroundColor: 'var(--charcoal)', color: '#FFFFFF', border: 'none',
            padding: '10px 20px', borderRadius: '30px', fontSize: '13px',
            fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.65 : 1, whiteSpace: 'nowrap',
            transition: 'opacity 0.2s ease'
          }}>
            {isSubmitting ? 'Sending...' : 'Send Invitation'}
          </button>
        </form>
      </div>
    </div>
  );
}
