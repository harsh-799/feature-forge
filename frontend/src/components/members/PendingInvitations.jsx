import React from 'react';
import { createPortal } from 'react-dom';
import { FiChevronDown, FiMoreVertical, FiTrash2 } from 'react-icons/fi';

export default function PendingInvitations({
  pendingInvitations,
  pendingOpen,
  setPendingOpen,
  openPendingMenuIdx,
  setOpenPendingMenuIdx,
  handleTogglePendingMenu,
  pendingMenuPos,
  pendingMenuRef,
  handleRevokeInvitation
}) {
  const renderRoleBadge = (role) => {
    const normalized = (role || 'DEVELOPER').toUpperCase();
    const label = normalized === 'ADMIN' ? 'Admin' : normalized === 'QA' ? 'QA' : 'Developer';
    const styles = {
      ADMIN: { color: '#1F2937', bg: '#F3F4F6', border: '#E5E7EB' },
      QA: { color: '#1E40AF', bg: '#EFF6FF', border: '#DBEAFE' },
      DEVELOPER: { color: '#9A3412', bg: '#FFF7ED', border: '#FFEDD5' }
    };
    const current = styles[normalized] || styles.DEVELOPER;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '11.5px',
        fontWeight: 500,
        color: current.color,
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        padding: '2px 9px',
        borderRadius: '6px',
        letterSpacing: '-0.01em'
      }}>
        {label}
      </span>
    );
  };

  const renderStatusBadge = (status) => {
    const isPending = (status || '').toUpperCase() === 'PENDING';
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '11.5px',
        fontWeight: 500,
        color: isPending ? '#B45309' : '#15803D',
        backgroundColor: isPending ? '#FFFBEB' : '#F0FDF4',
        border: `1px solid ${isPending ? '#FDE68A' : '#BBF7D0'}`,
        padding: '2px 9px',
        borderRadius: '20px',
        letterSpacing: '-0.01em'
      }}>
        <span style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: isPending ? '#D97706' : '#22C55E',
          flexShrink: 0
        }} />
        {isPending ? 'Pending' : 'Active'}
      </span>
    );
  };

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
        className={`invite-header${pendingOpen ? ' open' : ''}`}
        onClick={() => setPendingOpen(p => !p)}
        role="button"
        aria-expanded={pendingOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
            Pending Invitations
          </h3>
          <span style={{
            fontSize: '11.5px', fontWeight: 600, color: '#92400E',
            backgroundColor: '#FEF3C7', border: '1px solid #FDE68A',
            padding: '1px 8px', borderRadius: '12px'
          }}>
            {pendingInvitations.length}
          </span>
        </div>
        <FiChevronDown size={16} className={`invite-chevron${pendingOpen ? ' open' : ''}`} />
      </div>
      <div className={`invite-body${pendingOpen ? ' open' : ''}`}>
        <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />
        <div className="members-table-wrapper">
          <table className="members-table">
            <thead>
              <tr style={{ backgroundColor: '#FAF8F3', borderBottom: '1px solid var(--border-color)' }}>
                <th className="member-th-cell">INVITEE</th>
                <th className="member-th-cell">ROLE</th>
                <th className="member-th-cell">STATUS</th>
                <th className="member-th-cell member-th-action" />
              </tr>
            </thead>
            <tbody>
              {pendingInvitations.map((inv, idx) => (
                <tr key={inv.id || idx} style={{ borderBottom: idx === pendingInvitations.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                  <td className="member-info-cell">
                    <span className="member-email-text">{inv.email}</span>
                    {inv.invitedAt && (
                      <span className="member-name-text">
                        Invited {new Date(inv.invitedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </td>
                  <td className="member-badge-cell">
                    {renderRoleBadge(inv.role)}
                  </td>
                  <td className="member-badge-cell">
                    {renderStatusBadge('PENDING')}
                  </td>
                  <td className="member-action-cell">
                    <button
                      type="button"
                      className={`member-action-btn${openPendingMenuIdx === idx ? ' active' : ''}`}
                      aria-label="Invitation options"
                      aria-expanded={openPendingMenuIdx === idx}
                      onClick={(e) => handleTogglePendingMenu(e, idx)}
                    >
                      <FiMoreVertical size={16} />
                    </button>
                    {openPendingMenuIdx === idx && createPortal(
                      <div
                        ref={pendingMenuRef}
                        className={`member-action-dropdown ${pendingMenuPos.openUpward ? 'open-upward' : ''}`}
                        style={{
                          position: 'fixed',
                          top: pendingMenuPos.openUpward ? 'auto' : `${pendingMenuPos.top}px`,
                          bottom: pendingMenuPos.openUpward ? `${window.innerHeight - pendingMenuPos.top}px` : 'auto',
                          right: `${pendingMenuPos.right}px`,
                          zIndex: 9999
                        }}
                        role="menu"
                      >
                        <button
                          type="button"
                          className="member-action-item"
                          role="menuitem"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenPendingMenuIdx(null);
                            handleRevokeInvitation(inv);
                          }}
                        >
                          <FiTrash2 size={14} style={{ flexShrink: 0 }} />
                          <span>Revoke Invitation</span>
                        </button>
                      </div>,
                      document.body
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
