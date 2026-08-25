import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BrandMark } from '../components/landing/Brand'
import { acceptWorkspaceInvitation, listWorkspaces } from '../api/workspaceApi'
import { getErrorMessage } from '../api/authApi'
import './AcceptInvite.css'

export default function AcceptInvite() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const handleAccept = async () => {
    if (!token) {
      toast.error('Invalid or missing invitation token.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await acceptWorkspaceInvitation(token);
      toast.success(response?.message || 'Invitation accepted successfully!');

      // Refresh workspaces to activate the new workspace in localStorage
      try {
        const workspaces = await listWorkspaces();
        if (workspaces && workspaces.length > 0) {
          // Set the active workspace to the newly joined/first workspace
          const activeWs = workspaces[workspaces.length - 1] || workspaces[0];
          localStorage.setItem('currentWorkspaceId', activeWs.workspaceId);
          localStorage.setItem('currentWorkspaceName', activeWs.workspaceName);
          localStorage.setItem('currentWorkspaceRole', activeWs.role || 'DEVELOPER');
          localStorage.setItem('currentUserWorkspaceRole', activeWs.role);
        }
      } catch (err) {
        console.error('Error refreshing workspace list after accept:', err);
      }

      navigate('/app/overview');
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="accept-invite-page-container">
      <div className="accept-invite-card">
        <div className="accept-invite-logo-wrapper">
          <BrandMark />
        </div>
        <h1 className="accept-invite-title">
          Workspace Invitation
        </h1>
        <p className="accept-invite-description">
          You have been invited to collaborate on this workspace. Accept to join and start managing flags.
        </p>

        <button 
          onClick={handleAccept} 
          disabled={isLoading || !token}
          className="accept-invite-btn"
        >
          {isLoading ? 'Accepting Invitation...' : 'Accept Invitation'}
        </button>
      </div>
    </div>
  )
}
