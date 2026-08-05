import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { FiArrowLeft, FiPlus, FiMail, FiShield, FiX, FiCode, FiCheckSquare, FiChevronDown, FiUsers } from 'react-icons/fi'
import { getWorkspaceMembers, inviteWorkspaceMember } from '../../api/workspaceApi'
import { getErrorMessage } from '../../api/authApi'
import { toast } from 'react-toastify'
import './WorkspaceMembers.css'

export default function WorkspaceMembers() {
  const { currentWorkspaceId, role } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('DEVELOPER');
  const [isInviting, setIsInviting] = useState(false);

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  const isAdmin = role === 'ADMIN';

  const fetchMembers = async () => {
    if (!currentWorkspaceId) return;
    setIsLoading(true);
    const startTime = Date.now();
    try {
      const data = await getWorkspaceMembers(currentWorkspaceId);

      // Enforce a minimum loader duration of 350ms to prevent skeleton screen flashing/flicker
      const elapsed = Date.now() - startTime;
      const minDelay = 350;
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }

      setMembers(data);
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (role && !isAdmin) {
      toast.error("Unauthorized: Only Admins can manage workspace members.");
      navigate('/app/overview');
      return;
    }
    fetchMembers();
  }, [currentWorkspaceId, role, isAdmin, navigate]);

  useEffect(() => {
    if (location.state?.openInvite && isAdmin) {
      setIsInviteModalOpen(true);
      // Clear navigation state to prevent opening modal again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isAdmin]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Email address is required.');
      return;
    }

    setIsInviting(true);
    try {
      await inviteWorkspaceMember({
        email: inviteEmail.trim(),
        role: inviteRole,
        workspaceId: currentWorkspaceId
      });
      toast.success('Invitation email sent successfully!');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('DEVELOPER');
      fetchMembers(); // refresh memberships list
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="members-page-container">
      <div className="back-nav-row">
        <button onClick={() => navigate('/app/features')} className="back-btn-link">
          <FiArrowLeft style={{ marginRight: '6px' }} /> Back to Workspace
        </button>
      </div>

      <header className="members-page-header">
        <div>
          <h1 className="members-title">Workspace Members</h1>
          <p className="members-description">
            View collaborators and manage role configurations for this project workspace.
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsInviteModalOpen(true)} className="invite-action-btn">
            <FiPlus size={16} style={{ marginRight: '6px' }} /> Invite Member
          </button>
        )}
      </header>

      {isLoading ? (
        <div className="members-loading-grid">
          {[1, 2, 3].map(n => (
            <div key={n} className="member-card-skeleton pulse">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text-group">
                <div className="skeleton-line name"></div>
                <div className="skeleton-line email"></div>
              </div>
              <div className="skeleton-badge"></div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="members-empty-card">
          <div className="empty-state-icon-circle">
            <FiUsers size={24} />
          </div>
          <h3>No collaborators found</h3>
          <p>Invite team members to this workspace to collaborate on feature flag releases, staging setups, and progressive rollouts.</p>
          {isAdmin && (
            <button onClick={() => setIsInviteModalOpen(true)} className="empty-state-create-btn">
              <FiPlus style={{ marginRight: '6px' }} /> Invite Collaborator
            </button>
          )}
        </div>
      ) : (
        <div className="members-list-card">
          <div className="members-table-header">
            <div className="col-user">MEMBER</div>
            <div className="col-email">EMAIL</div>
            <div className="col-role">ROLE</div>
          </div>
          <div className="members-rows-stack">
            {members.map(member => (
              <div key={member.memberId} className="member-row">
                <div className="member-user-cell">
                  <div className="member-avatar">
                    {member.fullname ? member.fullname.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="member-name-text">
                    {member.fullname || <span className="unnamed-placeholder">Pending Acceptance</span>}
                  </span>
                </div>
                <div className="member-email-cell">{member.email}</div>
                <div className="member-role-cell">
                  <span className={`role-badge ${member.role.toLowerCase()}`}>
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Member Modal - Rendered via React Portal */}
      {isInviteModalOpen && createPortal(
        <div className="modal-overlay" onClick={() => setIsInviteModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite Collaborator</h3>
              <button className="modal-close-btn" onClick={() => setIsInviteModalOpen(false)}>
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="modal-form">
              <div className="modal-form-group">
                <label htmlFor="inviteEmail" className="modal-form-label">EMAIL ADDRESS</label>
                <div className="modal-input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    id="inviteEmail"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="modal-form-input"
                    disabled={isInviting}
                    required
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">ASSIGN ROLE</label>
                <div className="custom-select-container" ref={roleDropdownRef}>
                  <button
                    type="button"
                    className="custom-select-trigger"
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    disabled={isInviting}
                  >
                    <span className="selected-value-wrapper">
                      {inviteRole === 'DEVELOPER' && <FiCode className="input-icon-left" />}
                      {inviteRole === 'QA' && <FiCheckSquare className="input-icon-left" />}
                      {inviteRole === 'ADMIN' && <FiShield className="input-icon-left" />}
                      <span className="selected-text">
                        {inviteRole === 'DEVELOPER' && 'Developer (Manage and Promote Flags)'}
                        {inviteRole === 'QA' && 'QA Engineer (Verify and Approve Staging)'}
                        {inviteRole === 'ADMIN' && 'Admin (Full Control, Release to Production)'}
                      </span>
                    </span>
                    <FiChevronDown className="select-arrow" />
                  </button>

                  {isRoleDropdownOpen && (
                    <div className="custom-select-options">
                      <button
                        type="button"
                        className={`custom-option ${inviteRole === 'DEVELOPER' ? 'active' : ''}`}
                        onClick={() => {
                          setInviteRole('DEVELOPER');
                          setIsRoleDropdownOpen(false);
                        }}
                      >
                        <FiCode className="option-icon" />
                        <div className="option-text-group">
                          <span className="option-title">Developer</span>
                          <span className="option-desc">Manage and Promote Flags</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={`custom-option ${inviteRole === 'QA' ? 'active' : ''}`}
                        onClick={() => {
                          setInviteRole('QA');
                          setIsRoleDropdownOpen(false);
                        }}
                      >
                        <FiCheckSquare className="option-icon" />
                        <div className="option-text-group">
                          <span className="option-title">QA Engineer</span>
                          <span className="option-desc">Verify and Approve Staging</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={`custom-option ${inviteRole === 'ADMIN' ? 'active' : ''}`}
                        onClick={() => {
                          setInviteRole('ADMIN');
                          setIsRoleDropdownOpen(false);
                        }}
                      >
                        <FiShield className="option-icon" />
                        <div className="option-text-group">
                          <span className="option-title">Admin</span>
                          <span className="option-desc">Full Control, Release to Production</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="modal-cancel-btn"
                  disabled={isInviting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={isInviting}
                >
                  {isInviting ? 'Sending Invite...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
