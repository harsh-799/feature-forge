import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FiUsers, FiMail, FiShield, FiCheckCircle, FiLock, FiAlertTriangle, FiLogOut, FiArrowRight, FiZap, FiSliders } from 'react-icons/fi'
import { getInvitationDetails, acceptWorkspaceInvitation } from '../../api/workspaceApi'
import { getErrorMessage } from '../../api/authApi'
import { BrandMark } from '../../components/Brand/Brand'
import { toast } from 'react-toastify'
import './AcceptInvite.css'

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = !!localStorage.getItem('token');
  const loggedInEmail = localStorage.getItem('userEmail');

  const fetchInviteDetails = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getInvitationDetails(token);
      setInvitation(data);
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInviteDetails();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const res = await acceptWorkspaceInvitation(token);
      toast.success(res.message || 'Joined workspace successfully!');
      
      // Auto-activate the newly joined workspace in localStorage
      if (invitation?.workspaceId) {
        localStorage.setItem('currentWorkspaceId', invitation.workspaceId);
        localStorage.setItem('currentWorkspaceName', invitation.workspaceName);
      }
      
      // Redirect to the dashboard
      navigate('/app/features');
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutAndRedirect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentWorkspaceId');
    localStorage.removeItem('currentWorkspaceName');
    
    // Redirect to login preserving the token redirect
    const redirectPath = `/accept-invite?token=${token}`;
    navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  };

  // Helper to format role names
  const formatRoleName = (r) => {
    if (r === 'DEVELOPER') return 'Developer';
    if (r === 'QA') return 'QA Engineer';
    if (r === 'ADMIN') return 'Admin';
    return r;
  };

  if (!token) {
    return (
      <div className="accept-invite-page">
        <div className="accept-invite-glow"></div>
        <div className="accept-invite-card error">
          <FiAlertTriangle className="error-icon" size={48} />
          <h2>Missing Token</h2>
          <p>No invitation token was detected in your URL. Please verify the link in your email and try again.</p>
          <button className="invite-btn-primary" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="accept-invite-page">
        <div className="accept-invite-glow"></div>
        <div className="accept-invite-card loading">
          <div className="invite-spinner"></div>
          <p>Verifying invitation token...</p>
        </div>
      </div>
    );
  }

  // Handle cases where token is expired, already accepted, or generally invalid
  if (!invitation || !invitation.valid) {
    return (
      <div className="accept-invite-page">
        <div className="accept-invite-glow"></div>
        <div className="accept-invite-card error">
          <FiLock className="error-icon" size={48} style={{ color: '#F97316' }} />
          <h2>Invitation Unusable</h2>
          <p className="error-message-text">
            {invitation?.message || 'This invitation link is invalid or has already been accepted.'}
          </p>
          {invitation?.workspaceName && (
            <div className="error-context-box">
              <span className="context-label">Workspace</span>
              <span className="context-value">{invitation.workspaceName}</span>
            </div>
          )}
          <div className="invite-btn-stack">
            <button className="invite-btn-primary" onClick={() => navigate('/login')}>
              Sign In to FeatureForge
            </button>
            <button className="invite-btn-outline" onClick={() => navigate('/')}>
              Go to Landing Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isEmailMismatch = loggedInEmail && invitation.invitedEmail && 
    loggedInEmail.trim().toLowerCase() !== invitation.invitedEmail.trim().toLowerCase();

  return (
    <div className="accept-invite-page">
      <div className="accept-invite-glow"></div>
      
      {/* Brand Header */}
      <div className="invite-brand-header" onClick={() => navigate('/')}>
        <BrandMark />
        <span className="invite-brand-name">FeatureForge</span>
      </div>

      <div className="accept-invite-container">
        {/* Subtle Decorative Background Elements */}
        <div className="decor-element pos-1">
          <FiZap className="decor-icon orange" size={14} />
          <code className="decor-pill">checkout_rollout</code>
        </div>
        <div className="decor-element pos-2">
          <span className="decor-badge active">Active</span>
        </div>
        <div className="decor-element pos-3">
          <span className="decor-dot"></span>
        </div>
        <div className="decor-element pos-4">
          <FiSliders className="decor-icon" size={14} />
          <code className="decor-pill">targeting_v2</code>
        </div>
        <div className="decor-element pos-5">
          <span className="decor-badge staged">QA Approved</span>
        </div>
        <div className="decor-element pos-6">
          <span className="decor-dot large"></span>
        </div>
        <div className="decor-element pos-7">
          <code className="decor-pill">dev_mode</code>
          <span className="decor-dot mini"></span>
        </div>

        {/* Main Central Card */}
        <div className="accept-invite-card">
          <div className="invite-badge-editorial">
            WORKSPACE INVITATION
          </div>

          <h1 className="invite-card-title">
            Collaborate on <br />
            <span className="highlight-workspace">{invitation.workspaceName}</span>
          </h1>

          <p className="invite-card-subtitle">
            <strong>{invitation.inviterName}</strong> has invited you to collaborate with them on FeatureForge.
          </p>

          {/* Invite Info Grid Card */}
          <div className="invite-info-grid">
            <div className="info-grid-row">
              <FiMail className="row-icon" />
              <div className="row-text-group">
                <span className="row-label">Invited Email</span>
                <span className="row-value">{invitation.invitedEmail}</span>
              </div>
            </div>
            <div className="info-grid-row">
              <FiShield className="row-icon" />
              <div className="row-text-group">
                <span className="row-label">Assigned Role</span>
                <span className="row-value">{formatRoleName(invitation.role)}</span>
              </div>
            </div>
          </div>

          {/* Email Mismatch alert banner */}
          {isEmailMismatch && (
            <div className="mismatch-warning-banner">
              <FiAlertTriangle className="warning-icon" size={16} />
              <div className="warning-text">
                Logged in as <strong>{loggedInEmail}</strong>, but this invite was sent to <strong>{invitation.invitedEmail}</strong>. Please switch accounts.
              </div>
            </div>
          )}

          {/* CTA Stack */}
          <div className="invite-btn-stack">
            {!isAuthenticated ? (
              <>
                <button 
                  className="invite-btn-primary" 
                  onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/accept-invite?token=${token}`)}`)}
                >
                  Sign In to Accept <FiArrowRight style={{ marginLeft: '6px' }} />
                </button>
                <button 
                  className="invite-btn-outline" 
                  onClick={() => navigate(`/signup?redirect=${encodeURIComponent(`/accept-invite?token=${token}`)}`)}
                >
                  Create Account
                </button>
              </>
            ) : isEmailMismatch ? (
              <button className="invite-btn-primary destructive" onClick={handleLogoutAndRedirect}>
                <FiLogOut style={{ marginRight: '8px' }} /> Switch Accounts / Sign In
              </button>
            ) : (
              <button 
                className="invite-btn-primary" 
                onClick={handleAccept}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining Workspace...' : 'Accept Invitation'} <FiCheckCircle style={{ marginLeft: '6px' }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
