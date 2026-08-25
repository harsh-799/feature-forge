import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useOutletContext } from 'react-router-dom'
import {
  FiArrowLeft, FiMail, FiSearch, FiChevronDown,
  FiUsers, FiUserCheck, FiClock, FiShield, FiTerminal, FiCheckSquare,
  FiMoreVertical, FiTrash2, FiAlertTriangle, FiX
} from 'react-icons/fi'
import { getWorkspaceMembers, inviteWorkspaceMember, removeWorkspaceMember, getPendingInvitations, revokeWorkspaceInvitation } from '../api/workspaceApi'
import { getErrorMessage } from '../api/authApi'
import { toast } from 'react-toastify'

export default function WorkspaceMembers() {
  const { currentWorkspaceId } = useOutletContext();
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('DEVELOPER');
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Confirmation modal state
  const [confirmMember, setConfirmMember] = useState(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  // Row action menu state
  const [openMenuIdx, setOpenMenuIdx] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, openUpward: false });
  const menuRef = useRef(null);

  // Pending invitations state
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [openPendingMenuIdx, setOpenPendingMenuIdx] = useState(null);
  const [pendingMenuPos, setPendingMenuPos] = useState({ top: 0, right: 0, openUpward: false });
  const pendingMenuRef = useRef(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

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

  const fetchMembers = async (showSkeleton = true) => {
    if (!currentWorkspaceId) return;
    if (showSkeleton) setIsLoading(true);
    try {
      const response = await getWorkspaceMembers(currentWorkspaceId);
      if (response && response.success) {
        setMembers(response.membersData || []);
      } else {
        toast.error(response?.message || 'Failed to load workspace members.');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      if (showSkeleton) setIsLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    if (!currentWorkspaceId) return;
    try {
      const response = await getPendingInvitations(currentWorkspaceId);
      if (response && response.success) {
        setPendingInvitations(response.data || []);
      }
    } catch (err) {
      // silent catch
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchPendingInvitations();
  }, [currentWorkspaceId]);

  // Close action dropdown on click outside, Escape key, or scroll
  useEffect(() => {
    if (openMenuIdx === null && openPendingMenuIdx === null) return;
    const handleOutsideClick = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      if (pendingMenuRef.current && pendingMenuRef.current.contains(e.target)) return;
      if (e.target.closest('.member-action-btn')) return;
      setOpenMenuIdx(null);
      setOpenPendingMenuIdx(null);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenMenuIdx(null);
        setOpenPendingMenuIdx(null);
      }
    };
    const handleScrollOrResize = () => {
      setOpenMenuIdx(null);
      setOpenPendingMenuIdx(null);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [openMenuIdx, openPendingMenuIdx]);

  const handleToggleMenu = (e, idx) => {
    e.stopPropagation();
    if (openMenuIdx === idx) {
      setOpenMenuIdx(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 50;

    setMenuPos({
      top: openUpward ? rect.top - 4 : rect.bottom + 6,
      right: Math.max(12, window.innerWidth - rect.right),
      openUpward
    });
    setOpenMenuIdx(idx);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!email.trim()) {
      toast.error('Email address is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await inviteWorkspaceMember({
        email: email.trim(),
        role: inviteRole,
        workspaceId: currentWorkspaceId
      });
      toast.success('Invitation sent successfully!');
      setEmail('');
      setInviteRole('DEVELOPER');
      fetchMembers(false);
      fetchPendingInvitations();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeInvitation = async (invitation) => {
    const invId = invitation.id;
    if (!invId) {
      toast.error('Invitation ID not found.');
      return;
    }
    try {
      const response = await revokeWorkspaceInvitation(currentWorkspaceId, invId);
      if (response && response.success) {
        toast.success(response.message || 'Invitation revoked successfully.');
        fetchPendingInvitations();
      } else {
        toast.error(response?.message || 'Failed to revoke invitation.');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    }
  };

  const handleTogglePendingMenu = (e, idx) => {
    e.stopPropagation();
    if (openPendingMenuIdx === idx) {
      setOpenPendingMenuIdx(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 50;

    setPendingMenuPos({
      top: openUpward ? rect.top - 4 : rect.bottom + 6,
      right: Math.max(12, window.innerWidth - rect.right),
      openUpward
    });
    setOpenPendingMenuIdx(idx);
  };

  const handleConfirmRemoveMember = async () => {
    if (!confirmMember) return;
    const memberId = confirmMember.userId || confirmMember.id;
    if (!memberId) {
      toast.error('Member ID not found.');
      return;
    }
    setIsRemovingMember(true);
    try {
      const response = await removeWorkspaceMember(currentWorkspaceId, memberId);
      if (response && response.success) {
        toast.success(response.message || 'Member removed successfully.');
        setConfirmMember(null);
        fetchMembers(false);
      } else {
        toast.error(response?.message || 'Failed to remove member.');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsRemovingMember(false);
    }
  };

  // Derived stats
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'ACTIVE' || !m.status).length;
  const pendingMembers = members.filter(m => m.status === 'PENDING').length;
  const adminCount = members.filter(m => m.role === 'ADMIN').length;
  const devCount = members.filter(m => m.role === 'DEVELOPER').length;
  const qaCount = members.filter(m => m.role === 'QA').length;

  // Filtered table rows
  const filteredMembers = members.filter(m => {
    const matchesEmail = m.email.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesRole = roleFilter === '' || m.role === roleFilter;
    return matchesEmail && matchesRole;
  });

  return (
    <div className="members-page" style={{ fontFamily: 'var(--sans)', textAlign: 'left', width: '100%' }}>
      <style>{`
        .members-page-inner {
          max-width: 1100px;
          width: 100%;
          box-sizing: border-box;
        }
        .members-two-col {
          display: grid;
          grid-template-columns: 1fr minmax(0, 29%);
          gap: 28px;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }
        .members-right-panel {
          position: sticky;
          top: 24px;
        }

        /* Filter row */
        .members-filter-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border-color);
          background-color: #FFFFFF;
          border-radius: 16px 16px 0 0;
        }
        .members-search-input-wrapper {
          flex: 1;
          max-width: 300px;
          position: relative;
        }
        .members-search-input {
          width: 100%;
          padding: 9px 12px 9px 33px;
          border: 1px solid var(--border-color);
          border-radius: 30px;
          font-size: 13px;
          outline: none;
          font-family: var(--sans);
          background-color: #FAF8F3;
          color: var(--text-heading);
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        .members-search-input:focus {
          border-color: var(--accent);
          background-color: #FFFFFF;
        }
        .members-role-select {
          padding: 9px 14px;
          border: 1px solid var(--border-color);
          border-radius: 30px;
          font-size: 13px;
          outline: none;
          font-family: var(--sans);
          background-color: #FAF8F3;
          color: var(--text-primary);
          cursor: pointer;
          min-width: 130px;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        .members-role-select:focus {
          border-color: var(--accent);
          background-color: #FFFFFF;
        }

        /* Invite accordion */
        .invite-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          padding: 18px 20px;
          border-radius: 16px;
          transition: background-color 0.2s ease;
        }
        .invite-header:hover { background-color: rgba(0,0,0,0.025); }
        .invite-header.open  { border-radius: 16px 16px 0 0; }
        .invite-chevron {
          color: var(--text-primary);
          opacity: 0.45;
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
          flex-shrink: 0;
        }
        .invite-chevron.open { transform: rotate(180deg); }
        .invite-body {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease;
        }
        .invite-body.open {
          max-height: 1000px;
          opacity: 1;
          transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease 0.06s;
        }

        /* Summary panel */
        .summary-card {
          background: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.01);
        }
        .summary-header {
          padding: 16px 20px 14px;
          border-bottom: 1px solid var(--border-color);
        }
        .summary-stat-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 20px;
          border-bottom: 1px solid var(--border-color);
          transition: background-color 0.15s ease;
        }
        .summary-stat-row:hover { background-color: rgba(0,0,0,0.012); }
        .summary-stat-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .summary-stat-label {
          font-size: 12.5px;
          color: var(--text-primary);
          flex: 1;
        }
        .summary-stat-value {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-heading);
        }
        .summary-section-label {
          padding: 11px 20px 9px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--text-primary);
          opacity: 0.5;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-color);
        }
        .role-bar-row {
          padding: 10px 20px;
          border-bottom: 1px solid var(--border-color);
        }
        .role-bar-row:last-child { border-bottom: none; }
        .role-bar-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .role-bar-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: var(--text-primary);
          font-weight: 500;
        }
        .role-bar-count {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-heading);
        }
        .role-bar-track {
          width: 100%;
          height: 4px;
          background-color: var(--border-color);
          border-radius: 99px;
          overflow: hidden;
        }
        .role-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.55s cubic-bezier(0.4,0,0.2,1);
        }

        /* Table styling & responsiveness */
        .members-table-card {
          background-color: #FFFFFF;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.01);
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .members-table-wrapper {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          border-radius: 0 0 16px 16px;
        }
        .members-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .member-th-cell {
          padding: 13px 16px;
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-primary);
          opacity: 0.55;
          letter-spacing: 0.04em;
        }
        .member-th-action {
          padding: 13px 16px 13px 0;
          width: 36px;
          text-align: right;
        }
        .member-info-cell {
          padding: 15px 16px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-heading);
          min-width: 0;
        }
        .member-email-text {
          overflow-wrap: anywhere;
          word-break: break-word;
          display: block;
        }
        .member-name-text {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-primary);
          opacity: 0.6;
          margin-top: 3px;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .member-badge-cell {
          padding: 15px 12px;
          white-space: nowrap;
        }

        /* Action menu */
        .member-action-cell {
          padding: 15px 16px 15px 0;
          text-align: right;
          white-space: nowrap;
          width: 36px;
          vertical-align: middle;
        }
        .member-action-wrapper {
          position: relative;
          display: inline-block;
        }
        .member-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid transparent;
          background: transparent;
          color: #6B7280;
          opacity: 0.75;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .member-action-btn:hover,
        .member-action-btn.active {
          opacity: 1;
          color: var(--text-heading);
          background-color: rgba(38, 37, 33, 0.06);
          border-color: rgba(38, 37, 33, 0.08);
        }
        .member-action-dropdown {
          position: fixed;
          min-width: 148px;
          background-color: #FFFFFF;
          border: 1px solid rgba(38, 37, 33, 0.1);
          border-radius: 10px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
          padding: 4px;
          z-index: 9999;
          transform-origin: top right;
          animation: dropdownEnter 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .member-action-dropdown.open-upward {
          transform-origin: bottom right;
          animation: dropdownUpwardEnter 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes dropdownEnter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes dropdownUpwardEnter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .member-action-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 7px 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          font-family: var(--sans);
          font-size: 12.5px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: #E11D48;
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease;
          text-align: left;
        }
        .member-action-item:hover {
          background-color: #FFF1F2;
          color: #E11D48;
        }

        /* Responsive */
        @media (max-width: 860px) {
          .members-two-col { grid-template-columns: 1fr; }
          .members-right-panel { position: static; order: -1; }
        }
        @media (max-width: 640px) {
          .members-filter-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            padding: 14px 14px;
          }
          .members-search-input-wrapper { max-width: 100%; }
          .members-role-select { width: 100%; }

          .member-th-cell {
            padding: 11px 6px;
            font-size: 9.5px;
          }
          .member-th-cell:first-child {
            padding-left: 12px;
          }
          .member-th-action {
            padding-right: 12px;
            width: 32px;
          }
          .member-info-cell {
            padding: 12px 6px 12px 12px;
            font-size: 12.5px;
          }
          .member-badge-cell {
            padding: 12px 4px;
          }
          .member-action-cell {
            padding: 12px 12px 12px 0;
            width: 32px;
          }
          .member-action-btn {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>

      <div className="members-page-inner">

        {/* Back link */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/app/overview" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none'
          }}>
            <FiArrowLeft size={15} /> Back to Overview
          </Link>
        </div>

        {/* Page heading */}
        <div style={{ marginBottom: '28px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em' }}>WORKSPACE MEMBERS</span>
          <h1 style={{ fontSize: '27px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '4px', letterSpacing: '-0.02em' }}>
            Manage Members
          </h1>
        </div>

        {/* Two-column grid */}
        <div className="members-two-col">

          {/* â”€â”€ LEFT: Invite + Table â”€â”€ */}
          <div style={{ minWidth: 0 }}>

            {/* Invite Collaborator accordion */}
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

            {/* Pending Invitations accordion (renders only when pendingInvitations > 0) */}
            {pendingInvitations.length > 0 && (
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
            )}

            {/* Members table */}
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
          </div>

          {/* — RIGHT: Summary Panel — */}
          <div className="members-right-panel">
            <div className="summary-card">

              <div className="summary-header">
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em' }}>OVERVIEW</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '3px' }}>Workspace Members</div>
              </div>

              <div className="summary-stat-row">
                <div className="summary-stat-icon" style={{ backgroundColor: 'rgba(38,37,33,0.05)' }}>
                  <FiUsers size={14} color="var(--text-heading)" />
                </div>
                <span className="summary-stat-label">Total Members</span>
                <span className="summary-stat-value">{isLoading ? '–' : totalMembers}</span>
              </div>

              <div className="summary-stat-row">
                <div className="summary-stat-icon" style={{ backgroundColor: 'rgba(47,146,84,0.08)' }}>
                  <FiUserCheck size={14} color="#2F9254" />
                </div>
                <span className="summary-stat-label">Active</span>
                <span className="summary-stat-value" style={{ color: '#2F9254' }}>{isLoading ? '–' : activeMembers}</span>
              </div>

              <div className="summary-stat-row" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="summary-stat-icon" style={{ backgroundColor: 'rgba(180,83,9,0.07)' }}>
                  <FiClock size={14} color="#B45309" />
                </div>
                <span className="summary-stat-label">Pending Invites</span>
                <span className="summary-stat-value" style={{ color: pendingMembers > 0 ? '#B45309' : 'var(--text-heading)' }}>
                  {isLoading ? '–' : pendingMembers}
                </span>
              </div>

              <div className="summary-section-label">Role Breakdown</div>

              {[
                { label: 'Admin', count: adminCount, icon: <FiShield size={12} color="#6B7280" />, barColor: 'rgba(107,114,128,0.6)' },
                { label: 'Developer', count: devCount, icon: <FiTerminal size={12} color="var(--accent)" />, barColor: 'var(--accent)' },
                { label: 'QA', count: qaCount, icon: <FiCheckSquare size={12} color="#3B82F6" />, barColor: '#3B82F6' },
              ].map(({ label, count, icon, barColor }) => {
                const pct = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;
                return (
                  <div className="role-bar-row" key={label}>
                    <div className="role-bar-meta">
                      <span className="role-bar-label">{icon}{label}</span>
                      <span className="role-bar-count">{isLoading ? '–' : count}</span>
                    </div>
                    <div className="role-bar-track">
                      <div className="role-bar-fill" style={{ width: isLoading ? '0%' : `${pct}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

        </div>
      </div>

      {/* Member Removal Confirmation Modal */}
      {confirmMember && createPortal(
        <div className="modal-overlay" onClick={() => !isRemovingMember && setConfirmMember(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px', padding: '28px' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FiAlertTriangle size={20} color="#DC2626" />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.01em' }}>
                    Remove Member
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', opacity: 0.8 }}>
                      {confirmMember.email || confirmMember.name || 'Member'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => !isRemovingMember && setConfirmMember(null)}
                disabled={isRemovingMember}
                aria-label="Close"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Warning Callout Box */}
            <div style={{
              backgroundColor: '#FAF8F3',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '22px'
            }}>
              <p style={{ fontSize: '13px', color: 'var(--text-heading)', fontWeight: 600, margin: '0 0 6px 0' }}>
                Are you sure you want to remove this member?
              </p>
              <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
                This user will lose access to this workspace and all associated feature flags immediately.
              </p>
            </div>

            {/* Footer Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '18px'
            }}>
              <button
                type="button"
                onClick={() => setConfirmMember(null)}
                disabled={isRemovingMember}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '9px 18px',
                  borderRadius: '30px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isRemovingMember ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveMember}
                disabled={isRemovingMember}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '30px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isRemovingMember ? 'not-allowed' : 'pointer',
                  opacity: isRemovingMember ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isRemovingMember ? 'Removing...' : 'Remove Member'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

