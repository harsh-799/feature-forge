import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { FiFolder, FiCheck, FiChevronDown, FiPlus, FiUser, FiHelpCircle, FiLogOut, FiAlertTriangle, FiGrid, FiToggleLeft, FiLayers, FiClock, FiUsers, FiTrash2 } from 'react-icons/fi'
import { listWorkspaces } from '../../api/workspaceApi'
import { toast } from 'react-toastify'
import { BrandMark } from '../Brand/Brand'
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
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkspaceChanging, setIsWorkspaceChanging] = useState(false);

  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const optionsRef = useRef(null);

  useEffect(() => {
    const cachedEmail = localStorage.getItem('userEmail');
    setUserEmail(cachedEmail || 'developer@featureforge.com');

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
          } else {
            setActiveWorkspace(list[0]);
            localStorage.setItem('currentWorkspaceId', list[0].workspaceId);
            localStorage.setItem('currentWorkspaceName', list[0].workspaceName);
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

    setTimeout(() => {
      setActiveWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspace.workspaceId);
      localStorage.setItem('currentWorkspaceName', workspace.workspaceName);
      setIsWorkspaceChanging(false);
    }, 150);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentWorkspaceId');
    localStorage.removeItem('currentWorkspaceName');
    navigate('/login');
  };

  const handleDeleteWorkspace = () => {
    toast.info('Workspace deletion is not supported in this version.', {
      icon: <FiAlertTriangle size={18} style={{ color: 'var(--accent)' }} />
    });
    setIsOptionsOpen(false);
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

  const avatarLetter = userEmail ? userEmail.charAt(0).toUpperCase() : 'F';
  const displayName = userEmail ? userEmail.split('@')[0] : 'Developer';
  const isAdmin = activeWorkspace?.role === 'ADMIN';

  return (
    <div className="app-container">
      {/* Sidebar navigation panel */}
      <aside className="app-sidebar">
        <div className="sidebar-top">
          <Link to="/" className="sidebar-brand-logo">
            <BrandMark />
            <span className="sidebar-brand-name">FeatureForge</span>
          </Link>

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
                  <Link to="/app/onboarding" className="workspace-create-new-btn">
                    <FiPlus size={14} style={{ marginRight: '8px' }} /> Create Workspace
                  </Link>
                </div>
              )}
            </div>

            {/* Workspace Options trigger button */}
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
                      navigate('/app/workspace/members');
                    }}
                  >
                    <FiUsers className="item-icon" style={{ marginRight: '8px' }} />
                    <span>Manage Members</span>
                  </button>
                  {isAdmin && (
                    <>
                      <div className="options-divider"></div>
                      <button className="options-item destructive" onClick={handleDeleteWorkspace}>
                        <FiTrash2 className="item-icon" style={{ marginRight: '8px' }} />
                        <span>Delete Workspace</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            <NavLink
              to="/app/overview"
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
            >
              <FiGrid className="nav-icon" />
              <span>Overview</span>
            </NavLink>
            <NavLink
              to="/app/features"
              className={({ isActive }) => `nav-link-item ${isActive || location.pathname.startsWith('/app/features') ? 'active' : ''}`}
            >
              <FiToggleLeft className="nav-icon" />
              <span>Feature Flags</span>
            </NavLink>
            <NavLink
              to="/app/environments"
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
            >
              <FiLayers className="nav-icon" />
              <span>Environments</span>
            </NavLink>
            <NavLink
              to="/app/activity"
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
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

      {/* Main Viewport (Key is bound to location.pathname to animate child content transitions on navigation) */}
      <main className={`app-main-viewport ${isWorkspaceChanging ? 'workspace-transitioning' : ''}`}>
        <div className="app-main-content-fade-wrapper" key={location.pathname}>
          <Outlet context={{
            currentWorkspaceId: activeWorkspace?.workspaceId,
            currentWorkspaceName: activeWorkspace?.workspaceName,
            role: activeWorkspace?.role
          }} />
        </div>
      </main>
    </div>
  );
}
