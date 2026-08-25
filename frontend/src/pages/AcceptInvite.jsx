import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { BrandMark } from '../components/landing/Brand'
import { acceptWorkspaceInvitation, listWorkspaces } from '../api/workspaceApi'
import { getErrorMessage } from '../api/authApi'

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#FAF8F3',
      fontFamily: 'var(--sans)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 8px 30px rgba(38, 37, 33, 0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <BrandMark />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Workspace Invitation
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '24px' }}>
          You have been invited to collaborate on this workspace. Accept to join and start managing flags.
        </p>

        <button 
          onClick={handleAccept} 
          disabled={isLoading || !token}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '30px',
            border: 'none',
            backgroundColor: 'var(--charcoal)',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isLoading || !token ? 'not-allowed' : 'pointer',
            opacity: isLoading || !token ? 0.7 : 1
          }}
        >
          {isLoading ? 'Accepting Invitation...' : 'Accept Invitation'}
        </button>
      </div>
    </div>
  )
}
