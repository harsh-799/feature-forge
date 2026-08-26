import React from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiMoreVertical, FiTrash2 } from 'react-icons/fi';

export default function MembersList({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  isLoading,
  filteredMembers,
  openMenuIdx,
  setOpenMenuIdx,
  handleToggleMenu,
  menuPos,
  menuRef,
  setConfirmMember
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
    <div className="members-table-card">
      <div className="members-filter-row">
        <div className="members-search-input-wrapper">
          <FiSearch size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-primary)', opacity: 0.55 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search members by email..."
            className="members-search-input"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="members-role-select">
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="QA">QA</option>
          <option value="DEVELOPER">Developer</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: 'var(--text-primary)' }}>
          Loading members...
        </div>
      ) : (
        <div className="members-table-wrapper">
          <table className="members-table">
            <thead>
              <tr style={{ backgroundColor: '#FAF8F3', borderBottom: '1px solid var(--border-color)' }}>
                <th className="member-th-cell">MEMBER</th>
                <th className="member-th-cell">ROLE</th>
                <th className="member-th-cell">STATUS</th>
                <th className="member-th-cell member-th-action" />
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '32px 20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-primary)', opacity: 0.6 }}>
                    No members match your criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m, idx) => {
                  const currentUserEmail = localStorage.getItem('userEmail');
                  const isSelf = currentUserEmail && m.email && currentUserEmail.trim().toLowerCase() === m.email.trim().toLowerCase();
                  return (
                    <tr key={idx} style={{ borderBottom: idx === filteredMembers.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                      <td className="member-info-cell">
                        <span className="member-email-text">{m.email}</span>
                        {m.name && <span className="member-name-text">{m.name}</span>}
                      </td>
                      <td className="member-badge-cell">
                        {renderRoleBadge(m.role)}
                      </td>
                      <td className="member-badge-cell">
                        {renderStatusBadge(m.status)}
                      </td>
                      <td className="member-action-cell">
                        {!isSelf && (
                          <>
                            <button
                              type="button"
                              className={`member-action-btn${openMenuIdx === idx ? ' active' : ''}`}
                              aria-label="Member options"
                              aria-expanded={openMenuIdx === idx}
                              onClick={(e) => handleToggleMenu(e, idx)}
                            >
                              <FiMoreVertical size={16} />
                            </button>
                            {openMenuIdx === idx && createPortal(
                              <div
                                ref={menuRef}
                                className={`member-action-dropdown ${menuPos.openUpward ? 'open-upward' : ''}`}
                                style={{
                                  position: 'fixed',
                                  top: menuPos.openUpward ? 'auto' : `${menuPos.top}px`,
                                  bottom: menuPos.openUpward ? `${window.innerHeight - menuPos.top}px` : 'auto',
                                  right: `${menuPos.right}px`,
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
                                    setOpenMenuIdx(null);
                                    setConfirmMember(m);
                                  }}
                                >
                                  <FiTrash2 size={14} style={{ flexShrink: 0 }} />
                                  <span>Remove Member</span>
                                </button>
                              </div>,
                              document.body
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
