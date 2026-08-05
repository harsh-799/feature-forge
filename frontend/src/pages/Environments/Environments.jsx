import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FiCopy, FiCheck, FiKey, FiLock, FiInfo, FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'react-toastify'
import './Environments.css'

export default function Environments() {
  const { currentWorkspaceId, currentWorkspaceName, role } = useOutletContext();
  const [copiedEnv, setCopiedEnv] = useState(null);
  const [envKeys, setEnvKeys] = useState(null);
  const [revealKeys, setRevealKeys] = useState({});

  const toggleReveal = (envName) => {
    setRevealKeys(prev => ({
      ...prev,
      [envName]: !prev[envName]
    }));
  };

  useEffect(() => {
    if (currentWorkspaceId) {
      const cached = localStorage.getItem(`apiKeys_${currentWorkspaceId}`);
      if (cached) {
        try {
          setEnvKeys(JSON.parse(cached));
        } catch (e) {
          setEnvKeys(null);
        }
      } else {
        setEnvKeys(null);
      }
    }
  }, [currentWorkspaceId]);

  const handleCopy = (envName, val) => {
    navigator.clipboard.writeText(val);
    setCopiedEnv(envName);
    toast.success(`${envName} API key copied!`);
    setTimeout(() => {
      setCopiedEnv(null);
    }, 2000);
  };

  const environmentsList = [
    {
      name: 'DEVELOPMENT',
      description: 'Used for local developer sandboxes and integration testing.',
      status: 'Active',
      color: '#3B82F6'
    },
    {
      name: 'STAGING',
      description: 'Matches production data. Used by QA engineers for acceptance testing.',
      status: 'Active',
      color: '#F59E0B'
    },
    {
      name: 'PRODUCTION',
      description: 'Real production customer traffic. Serves evaluated targeting rules.',
      status: 'Active',
      color: '#10B981'
    }
  ];

  const isKeyAccessible = (envName) => {
    if (role === 'ADMIN') return true;
    if (envName === 'DEVELOPMENT') {
      return role === 'DEVELOPER';
    }
    if (envName === 'STAGING') {
      return role === 'DEVELOPER' || role === 'QA';
    }
    if (envName === 'PRODUCTION') {
      return false;
    }
    return false;
  };

  return (
    <div className="environments-container">
      <header className="page-header-group">
        <h1 className="page-header-title">Environments</h1>
        <p className="page-header-description">
          Configure keys and monitor SDK status across your release pipeline.
        </p>
      </header>

      <div className="environments-grid">
        {environmentsList.map((env) => {
          const accessible = isKeyAccessible(env.name);
          const hasKey = accessible && envKeys && envKeys[env.name];
          const keyValue = hasKey ? envKeys[env.name] : 'ff_hash_sha256_secured_api_key_hidden';

          return (
            <div key={env.name} className="environment-card">
              <div className="env-card-header">
                <div className="env-title-group">
                  <div className="env-status-dot" style={{ backgroundColor: env.color }}></div>
                  <h3>{env.name}</h3>
                </div>
                <span className="env-badge active">{env.status}</span>
              </div>

              <p className="env-description">{env.description}</p>

              <div className="env-key-section">
                <div className="env-key-label">
                  <FiKey size={12} style={{ marginRight: '6px' }} />
                  <span>SDK CLIENT API KEY</span>
                </div>
                
                {!accessible ? (
                  <>
                    <div className="env-key-box restricted" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.02)' }}>
                      <code className="env-key-value" style={{ color: '#EF4444', fontStyle: 'italic' }}>
                        Restricted Access
                      </code>
                      <div className="env-key-action-btn locked" title="Access Restricted" style={{ color: '#EF4444' }}>
                        <FiLock size={14} />
                      </div>
                    </div>
                    <div className="env-key-note text-danger" style={{ display: 'flex', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: '#EF4444' }}>
                      <FiInfo size={12} style={{ marginRight: '6px', flexShrink: 0 }} />
                      <span>{env.name === 'PRODUCTION' ? 'Production keys are restricted to Workspace Admins.' : 'Development keys are restricted to Admins and Developers.'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="env-key-box">
                      <code className="env-key-value">
                        {hasKey ? (revealKeys[env.name] ? keyValue : 'ff_••••••••••••••••••••••••••••••••') : 'ff_••••••••••••••••••••••••••••••••'}
                      </code>
                      {hasKey && (
                        <button
                          onClick={() => toggleReveal(env.name)}
                          className="env-key-action-btn toggle-reveal"
                          title={revealKeys[env.name] ? "Hide Key" : "Show Key"}
                          type="button"
                        >
                          {revealKeys[env.name] ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                        </button>
                      )}
                      {hasKey ? (
                        <button
                          onClick={() => handleCopy(env.name, keyValue)}
                          className="env-key-action-btn copy"
                          title="Copy Key"
                          type="button"
                        >
                          {copiedEnv === env.name ? <FiCheck size={14} style={{ color: '#10B981' }} /> : <FiCopy size={14} />}
                        </button>
                      ) : (
                        <div className="env-key-action-btn locked" title="Key Secured">
                          <FiLock size={14} />
                        </div>
                      )}
                    </div>

                    {!hasKey && (
                      <div className="env-key-note">
                        <FiInfo size={12} style={{ marginRight: '6px', flexShrink: 0 }} />
                        <span>Key only shown once at creation. Authenticate via your secure SDK headers.</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
