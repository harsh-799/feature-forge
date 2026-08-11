import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { toast } from 'react-toastify'

export default function Environments() {
  const { currentWorkspaceId } = useOutletContext();
  const [apiKeys, setApiKeys] = useState({ DEVELOPMENT: 'ff_dev_...', STAGING: 'ff_staging_...', PRODUCTION: 'ff_prod_...' });
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    if (currentWorkspaceId) {
      const cached = localStorage.getItem(`apiKeys_${currentWorkspaceId}`);
      if (cached) {
        try {
          setApiKeys(JSON.parse(cached));
        } catch (e) {
          console.error('Failed to parse cached API keys:', e);
        }
      }
    }
  }, [currentWorkspaceId]);

  const handleCopy = (envName, val) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(envName);
    toast.success(`${envName} API key copied!`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <div className="environments-page" style={{ fontFamily: 'var(--sans)', textAlign: 'left' }}>
      <div className="environments-header" style={{ marginBottom: '32px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>ENVIRONMENTS</span>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '4px', letterSpacing: '-0.02em' }}>
          Project Environments
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '8px', opacity: 0.8 }}>
          Each environment generates a unique API key. Use these keys inside client initializations to evaluate active feature flags.
        </p>
      </div>

      <div className="env-keys-container" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {Object.entries(apiKeys).map(([env, keyVal]) => (
          <div key={env} style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)'
          }}>
            <h3 style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '12px' }}>
              {env}
            </h3>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              backgroundColor: '#FAF8F3',
              overflow: 'hidden'
            }}>
              <code style={{
                flex: 1,
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                padding: '12px 14px',
                whiteSpace: 'nowrap',
                overflowX: 'auto'
              }}>{keyVal}</code>
              <button
                type="button"
                onClick={() => handleCopy(env, keyVal)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderLeft: '1px solid var(--border-color)',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  transition: 'background-color 0.2s'
                }}
              >
                {copiedKey === env ? <FiCheck size={14} style={{ color: '#10B981' }} /> : <FiCopy size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
