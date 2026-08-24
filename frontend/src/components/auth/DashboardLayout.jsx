import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  FiFolder, 
  FiCheck, 
  FiChevronDown, 
  FiPlus, 
  FiUser, 
  FiHelpCircle, 
  FiLogOut, 
  FiUserMinus,
  FiAlertTriangle, 
  FiGrid, 
  FiToggleLeft, 
  FiLayers, 
  FiClock, 
  FiUsers, 
  FiTrash2, 
  FiMenu, 
  FiX 
} from 'react-icons/fi'
import { listWorkspaces, leaveWorkspace, deleteWorkspace } from '../../api/workspaceApi'
import { getErrorMessage } from '../../api/authApi'
import { toast } from 'react-toastify'
import { BrandMark } from '../landing/Brand'
import './DashboardLayout.css'

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null); // { workspaceId, workspaceName, role }
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false); // Admin Workspace options dropdown
  const [userEmail, setUserEmail] = useState('');
  const [fullname, setFullname] = useState(localStorage.getItem('userFullname') || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkspaceChanging, setIsWorkspaceChanging] = useState(false);
  
  // Mobile sidebar drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Leave workspace modal state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Delete workspace modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);

  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const optionsRef = useRef(null);

  useEffect(() => {
    const cachedEmail = localStorage.getItem('userEmail');
    setUserEmail(cachedEmail || 'developer@featureforge.com');
    const cachedFullname = localStorage.getItem('userFullname');
    setFullname(cachedFullname || '');

    const fetchWorkspacesData = async () => {
      try {
        const list = await listWorkspaces();
        setWorkspaces(list);

        if (list && list.length > 0) {
          const cachedId = localStorage.getItem('currentWorkspaceId');
          const matched = list.find(w => w.workspaceId === cachedId);
          if (matched) {
            setActiveWorkspace(matched);
            localStorage.setItem('currentWorkspaceName', matched.workspaceName);
            localStorage.setItem('currentWorkspaceRole', matched.role || 'DEVELOPER');
          } else {
            setActiveWorkspace(list[0]);
            localStorage.setItem('currentWorkspaceId', list[0].workspaceId);
            localStorage.setItem('currentWorkspaceName', list[0].workspaceName);
            localStorage.setItem('currentWorkspaceRole', list[0].role || 'DEVELOPER');
          }
        } else {
          navigate('/app/onboarding');
        }
      } catch (err) {
        console.error('Failed to load workspaces:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspacesData();
  }, [navigate]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setIsOptionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWorkspaceChange = (workspace) => {
    setIsWorkspaceChanging(true);
    setIsDropdownOpen(false);
    setIsSidebarOpen(false);

    setTimeout(() => {
      setActiveWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspace.workspaceId);
      localStorage.setItem('currentWorkspaceName', workspace.workspaceName);
      localStorage.setItem('currentWorkspaceRole', workspace.role || 'DEVELOPER');
      setIsWorkspaceChanging(false);
    }, 150);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullname');
    localStorage.removeItem('currentWorkspaceId');
    localStorage.removeItem('currentWorkspaceName');
    setIsSidebarOpen(false);
    navigate('/login');
  };

  const handleDeleteWorkspace = () => {
    setIsOptionsOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteWorkspace = async () => {
    if (!activeWorkspace?.workspaceId || isDeletingWorkspace) return;
    setIsDeletingWorkspace(true);
    try {
      const response = await deleteWorkspace(activeWorkspace.workspaceId);
      setIsDeleteModalOpen(false);
      if (response && response.success) {
        toast.success(response.message || 'Workspace deleted successfully.');

        const updatedList = workspaces.filter(w => w.workspaceId !== activeWorkspace.workspaceId);
        setWorkspaces(updatedList);

        if (updatedList.length > 0) {
          const nextWs = updatedList[0];
          setActiveWorkspace(nextWs);
          localStorage.setItem('currentWorkspaceId', nextWs.workspaceId);
          localStorage.setItem('currentWorkspaceName', nextWs.workspaceName);
          localStorage.setItem('currentWorkspaceRole', nextWs.role || 'DEVELOPER');
          navigate('/app/overview');
        } else {
          setActiveWorkspace(null);
          localStorage.removeItem('currentWorkspaceId');
          localStorage.removeItem('currentWorkspaceName');
          localStorage.removeItem('currentWorkspaceRole');
          navigate('/app/onboarding');
        }
      } else {
        toast.error(response?.message || 'Failed to delete workspace.');
      }
    } catch (err) {
      setIsDeleteModalOpen(false);
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsDeletingWorkspace(false);
    }
  };

  const handleConfirmLeaveWorkspace = async () => {
    if (!activeWorkspace?.workspaceId || isLeaving) return;
    setIsLeaving(true);
    try {
      const response = await leaveWorkspace(activeWorkspace.workspaceId);
      setIsLeaveModalOpen(false);
      if (response && response.success) {
        toast.success(response.message || 'You have left the workspace.');

        const updatedList = workspaces.filter(w => w.workspaceId !== activeWorkspace.workspaceId);
        setWorkspaces(updatedList);

        if (updatedList.length > 0) {
          const nextWs = updatedList[0];
          setActiveWorkspace(nextWs);
          localStorage.setItem('currentWorkspaceId', nextWs.workspaceId);
          localStorage.setItem('currentWorkspaceName', nextWs.workspaceName);
          localStorage.setItem('currentWorkspaceRole', nextWs.role || 'DEVELOPER');
          navigate('/app/overview');
        } else {
          setActiveWorkspace(null);
          localStorage.removeItem('currentWorkspaceId');
          localStorage.removeItem('currentWorkspaceName');
          localStorage.removeItem('currentWorkspaceRole');
          navigate('/app/onboarding');
        }
      } else {
        toast.error(response?.message || 'Failed to leave workspace.');
      }
    } catch (err) {
      setIsLeaveModalOpen(false);
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsLeaving(false);
    }
  };

  const formatRole = (role) => {
    if (!role) return 'Developer';
    if (role === 'ADMIN') return 'Admin';
    if (role === 'DEVELOPER') return 'Developer';
    if (role === 'QA') return 'QA Engineer';
    return role;
  };

  if (isLoading) {
    return (
      <div className="layout-skeleton-screen">
        <div className="layout-skeleton-sidebar">
          <div className="skeleton-logo pulse"></div>
          <div className="skeleton-selector pulse"></div>
          <div className="skeleton-nav pulse"></div>
          <div className="skeleton-nav pulse"></div>
          <div className="skeleton-nav pulse"></div>
        </div>
        <div className="layout-skeleton-content">
          <div className="skeleton-header pulse"></div>
          <div className="skeleton-body pulse"></div>
        </div>
      </div>
    );
  }

  const displayName = fullname || (userEmail ? userEmail.split('@')[0] : 'Developer');
  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : 'F';
  const isAdmin = activeWorkspace?.role === 'ADMIN';

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="app-mobile-header">
        <button 
          className="sidebar-toggle-hamburger" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle Navigation Sidebar"
        >
          <FiMenu size={22} />
        </button>
        <div className="mobile-header-brand">
          <BrandMark className="mobile-header-logo" />
          <span className="mobile-header-name">FeatureForge</span>
        </div>
        <button 
          className="mobile-header-avatar"
          onClick={() => {
            setIsSidebarOpen(true);
            setIsProfileOpen(true);
          }}
        >
          {avatarLetter}
        </button>
      </header>

      {/* Sidebar overlay backdrop */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar navigation panel */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'sidebar-drawer-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-header-wrapper">
            <Link to="/" className="sidebar-brand-logo" onClick={() => setIsSidebarOpen(false)}>
              <BrandMark />
              <span className="sidebar-brand-name">FeatureForge</span>
            </Link>
            {/* Mobile close button inside drawer */}
            <button 
              className="sidebar-close-btn" 
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close Sidebar"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Workspace selector area */}
          <div className="workspace-selector-container-wrapper">
            <div className="workspace-selector-container" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="workspace-selector-btn"
                aria-expanded={isDropdownOpen}
              >
                <div className="workspace-btn-content">
                  <FiFolder className="workspace-icon" />
                  <span className="workspace-name-text">
                    {activeWorkspace ? activeWorkspace.workspaceName : 'Select Project'}
                  </span>
                </div>
                <FiChevronDown size={14} className="chevron-icon" />
              </button>

              {isDropdownOpen && (
                <div className="workspace-dropdown-menu">
                  <div className="workspace-dropdown-header">SWITCH PROJECT</div>
                  <div className="workspace-list-items">
                    {workspaces.map((w) => (
                      <button
                        key={w.workspaceId}
                        onClick={() => handleWorkspaceChange(w)}
                        className={`workspace-item-btn ${activeWorkspace?.workspaceId === w.workspaceId ? 'active' : ''}`}
                      >
                        <div className="workspace-item-info">
                          <span className="workspace-item-name">{w.workspaceName}</span>
                          <span className="workspace-item-role">{formatRole(w.role)}</span>
                        </div>
                        {activeWorkspace?.workspaceId === w.workspaceId && <FiCheck className="checkmark" />}
                      </button>
                    ))}
                  </div>
                  <div className="workspace-dropdown-divider"></div>
                  <Link 
                    to="/app/onboarding" 
                    className="workspace-create-new-btn"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <FiPlus size={14} style={{ marginRight: '8px' }} /> Create Workspace
                  </Link>
                </div>
              )}
            </div>

            {/* Workspace Options trigger button */}
            {isAdmin && (
              <div className="workspace-options-menu-container" ref={optionsRef}>
                <button
                  onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                  className="workspace-options-btn"
                  title="Workspace Options"
                  aria-expanded={isOptionsOpen}
                >
                  •••
                </button>
                {isOptionsOpen && (
                  <div className="workspace-options-dropdown">
                    <button
                      className="options-item"
                      onClick={() => {
                        setIsOptionsOpen(false);
                        setIsSidebarOpen(false);
                        navigate('/app/workspace/members');
                      }}
                    >
                      <FiUsers className="item-icon" style={{ marginRight: '8px' }} />
                      <span>Manage Members</span>
                    </button>
                    <div className="options-divider"></div>
                    <button className="options-item destructive" onClick={handleDeleteWorkspace}>
                      <FiTrash2 className="item-icon" style={{ marginRight: '8px' }} />
                      <span>Delete Workspace</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            <NavLink
              to="/app/overview"
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <FiGrid className="nav-icon" />
              <span>Overview</span>
            </NavLink>
            <NavLink
              to="/app/features"
              className={({ isActive }) => `nav-link-item ${isActive || location.pathname.startsWith('/app/features') ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <FiToggleLeft className="nav-icon" />
              <span>Feature Flags</span>
            </NavLink>
            <NavLink
              to="/app/environments"
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <FiLayers className="nav-icon" />
              <span>Environments</span>
            </NavLink>
            <NavLink
              to="/app/activity"
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <FiClock className="nav-icon" />
              <span>Activity</span>
            </NavLink>
          </nav>
        </div>

        {/* Bottom Left Account Pill */}
        <div className="sidebar-bottom-pill-wrapper" ref={profileRef}>
          {isProfileOpen && (
            <div className="account-upward-dropdown">
              <div className="dropdown-user-header">
                <span className="dropdown-user-name">{displayName}</span>
                <span className="dropdown-user-email">{userEmail}</span>
              </div>
              <div className="dropdown-menu-divider"></div>

              <button
                className="dropdown-menu-item"
                onClick={() => {
                  setIsProfileOpen(false);
                  toast.info('Account Settings are coming soon.');
                }}
              >
                <FiUser className="item-icon" />
                <span>Account Settings</span>
              </button>

              <button
                className="dropdown-menu-item"
                onClick={() => {
                  setIsProfileOpen(false);
                  toast.info('Help Center is coming soon.');
                }}
              >
                <FiHelpCircle className="item-icon" />
                <span>Help Center</span>
              </button>

              {activeWorkspace && (
                <>
                  <div className="dropdown-menu-divider"></div>
                  <button
                    className="dropdown-menu-item danger"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsLeaveModalOpen(true);
                    }}
                  >
                    <FiUserMinus className="item-icon" />
                    <span>Leave Workspace</span>
                  </button>
                </>
              )}

              <div className="dropdown-menu-divider"></div>

              <button onClick={handleLogout} className="dropdown-menu-item logout">
                <FiLogOut className="item-icon" />
                <span>Logout</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="sidebar-account-pill-btn"
            aria-expanded={isProfileOpen}
          >
            <div className="pill-left-content">
              <div className="pill-avatar">{avatarLetter}</div>
              <div className="pill-text-details">
                <span className="pill-user-name">{displayName}</span>
                <span className="pill-user-role">{activeWorkspace ? formatRole(activeWorkspace.role) : 'Developer'}</span>
              </div>
            </div>
            <div className="pill-dots">•••</div>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className={`app-main-viewport ${isWorkspaceChanging ? 'workspace-transitioning' : ''}`}>
        <div className="app-main-content-fade-wrapper" key={location.pathname}>
          <Outlet context={{
            currentWorkspaceId: activeWorkspace?.workspaceId || localStorage.getItem('currentWorkspaceId'),
            currentWorkspaceName: activeWorkspace?.workspaceName || localStorage.getItem('currentWorkspaceName'),
            role: activeWorkspace?.role || localStorage.getItem('currentWorkspaceRole') || 'DEVELOPER'
          }} />
        </div>
      </main>

      {/* Leave Workspace Confirmation Modal */}
      {isLeaveModalOpen && (
        <div className="modal-overlay" onClick={() => !isLeaving && setIsLeaveModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '17px', fontWeight: 750, color: 'var(--text-heading)', margin: 0 }}>
                Leave workspace?
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => !isLeaving && setIsLeaveModalOpen(false)}
                disabled={isLeaving}
                aria-label="Close"
              >
                <FiX size={18} />
              </button>
            </div>

            <div style={{ padding: '8px 0 20px 0' }}>
              <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
                You will lose access to <strong>{activeWorkspace?.workspaceName || 'this workspace'}</strong> and its features.
              </p>
            </div>

            <div style={{
              display: 'flex',
              justify: 'flex-end',
              gap: '10px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '16px'
            }}>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                disabled={isLeaving}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '9px 16px',
                  borderRadius: '30px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isLeaving ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLeaveWorkspace}
                disabled={isLeaving}
                style={{
                  backgroundColor: '#E11D48',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '30px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isLeaving ? 'not-allowed' : 'pointer',
                  opacity: isLeaving ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isLeaving ? 'Leaving...' : 'Leave Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Workspace Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => !isDeletingWorkspace && setIsDeleteModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '17px', fontWeight: 750, color: 'var(--text-heading)', margin: 0 }}>
                Delete workspace?
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => !isDeletingWorkspace && setIsDeleteModalOpen(false)}
                disabled={isDeletingWorkspace}
                aria-label="Close"
              >
                <FiX size={18} />
              </button>
            </div>

            <div style={{ padding: '8px 0 20px 0' }}>
              <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{activeWorkspace?.workspaceName || 'this workspace'}</strong>? All feature flags, environments, and data associated with it will be permanently deleted.
              </p>
            </div>

            <div style={{
              display: 'flex',
              justify: 'flex-end',
              gap: '10px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '16px'
            }}>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeletingWorkspace}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '9px 16px',
                  borderRadius: '30px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isDeletingWorkspace ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteWorkspace}
                disabled={isDeletingWorkspace}
                style={{
                  backgroundColor: '#E11D48',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '30px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isDeletingWorkspace ? 'not-allowed' : 'pointer',
                  opacity: isDeletingWorkspace ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isDeletingWorkspace ? 'Deleting...' : 'Delete Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
