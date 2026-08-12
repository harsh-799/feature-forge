import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiCopy, FiCheck, FiArrowRight } from 'react-icons/fi'
import { createWorkspace } from '../api/workspaceApi'
import { getErrorMessage } from '../api/authApi'
import { BrandMark } from '../components/landing/Brand'
import './Onboarding.css'

export default function Onboarding() {
  const navigate = useNavigate();
  const [workspaceName, setWorkspaceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdKeys, setCreatedKeys] = useState(null); // { DEVELOPMENT: 'ff_...', STAGING: 'ff_...', PRODUCTION: 'ff_...' }
  const [copiedKey, setCopiedKey] = useState(null); // 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | null
  const [newWorkspaceId, setNewWorkspaceId] = useState(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!workspaceName.trim()) {
      toast.error('Workspace name cannot be empty.');
      return;
    }

    if (workspaceName.length > 100) {
      toast.error('Workspace name cannot exceed 100 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createWorkspace({ workspaceName: workspaceName.trim() });
      if (response.status && response.workspaceId) {
        setCreatedKeys(response.apiKeys);
        setNewWorkspaceId(response.workspaceId);
        setNewWorkspaceName(workspaceName.trim());
        
        // Cache new workspace keys locally for Environment API viewing in this browser
        localStorage.setItem(`apiKeys_${response.workspaceId}`, JSON.stringify(response.apiKeys));
        
        toast.success('Workspace created successfully!');
      } else {
        toast.error(response.message || 'Failed to create workspace.');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (envName, val) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(envName);
    toast.success(`${envName} API key copied!`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleContinue = () => {
    if (newWorkspaceId && newWorkspaceName) {
      localStorage.setItem('currentWorkspaceId', newWorkspaceId);
      localStorage.setItem('currentWorkspaceName', newWorkspaceName);
      localStorage.setItem('currentWorkspaceRole', 'ADMIN');
      navigate('/app/features');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentWorkspaceId');
    localStorage.removeItem('currentWorkspaceName');
    navigate('/login');
  };

  return (
    <div className="onboard-page-container">
      {/* Mini Brand Header */}
      <header className="onboard-header">
        <div className="onboard-logo-area">
          <BrandMark />
          <span className="onboard-brand-name">FeatureForge</span>
        </div>
        <button onClick={handleLogout} className="onboard-logout-btn">
          Sign Out
        </button>
      </header>

      <main className="onboard-main">
        {!createdKeys ? (
          <div className="onboard-card enter-workspace-card">
            <div className="onboard-card-header">
              <h1>Welcome to FeatureForge</h1>
              <p>Create your first project workspace to get started. Workspaces bundle your environments, feature flags, and team roles together.</p>
            </div>

            <form onSubmit={handleCreate} className="onboard-form">
              <div className="onboard-form-group">
                <label htmlFor="workspaceName" className="onboard-label">WORKSPACE NAME</label>
                <input
                  type="text"
                  id="workspaceName"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Engineering"
                  className="onboard-input"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="onboard-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Creating workspace...' : 'Create Workspace'}
              </button>
            </form>
          </div>
        ) : (
          <div className="onboard-card api-keys-card">
            <div className="onboard-card-header">
              <div className="success-badge-badge">✓ SUCCESS</div>
              <h1>Save your Environment API Keys</h1>
              <p>Below are the API keys generated for your environments. Copy them now; for security reasons, they cannot be shown again.</p>
            </div>

            <div className="onboard-keys-list">
              {Object.entries(createdKeys).map(([env, keyVal]) => (
                <div key={env} className="onboard-key-row">
                  <div className="onboard-key-env-name">{env}</div>
                  <div className="onboard-key-display-box">
                    <code className="onboard-key-code">{keyVal}</code>
                    <button
                      type="button"
                      onClick={() => handleCopy(env, keyVal)}
                      className="onboard-key-copy-btn"
                      aria-label={`Copy ${env} Key`}
                    >
                      {copiedKey === env ? <FiCheck size={14} className="copied" /> : <FiCopy size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="onboard-warning-banner">
              <strong>IMPORTANT:</strong> Store these keys safely in your environment variables. You will use these keys to authenticate evaluation requests from your microservices.
            </div>

            <button onClick={handleContinue} className="onboard-continue-btn">
              Continue to Application <FiArrowRight style={{ marginLeft: '8px' }} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
