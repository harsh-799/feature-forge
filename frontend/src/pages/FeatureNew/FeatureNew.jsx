import { useState } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { createFeature } from '../../api/featureApi'
import { getErrorMessage } from '../../api/authApi'
import { toast } from 'react-toastify'
import './FeatureNew.css'

export default function FeatureNew() {
  const navigate = useNavigate();
  const { currentWorkspaceId } = useOutletContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getGeneratedKey = (val) => {
    return val
      .trim()
      .toUpperCase()
      .replaceAll(/\s+/g, '_');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!name.trim()) {
      toast.error('Feature name cannot be blank.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createFeature({
        name: name.trim(),
        description: description.trim() || null,
        workspaceId: currentWorkspaceId
      });

      toast.success('Feature flag created successfully!');
      if (response && response.featureId) {
        navigate(`/app/features/${response.featureId}`);
      } else {
        navigate('/app/features');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new-flag-page-container">
      <Link to="/app/features" className="back-nav-link">
        <FiArrowLeft style={{ marginRight: '6px' }} /> Back to Feature Flags
      </Link>

      <div className="new-flag-card">
        <div className="new-flag-card-header">
          <h1>Create Feature Flag</h1>
          <p>Flags are initialized in IN_DEVELOPMENT status, disabled by default, and can be promoted through QA staging to Production.</p>
        </div>

        <form onSubmit={handleSubmit} className="new-flag-form">
          <div className="new-flag-form-group">
            <label htmlFor="flagName" className="new-flag-label">FEATURE NAME</label>
            <input
              type="text"
              id="flagName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enable Stripe Checkout"
              className="new-flag-input"
              disabled={isLoading}
              autoFocus
              required
            />
            {name.trim() && (
              <div className="new-flag-key-preview">
                <span>Generated Key:</span>
                <code>{getGeneratedKey(name)}</code>
              </div>
            )}
          </div>

          <div className="new-flag-form-group">
            <label htmlFor="flagDesc" className="new-flag-label">DESCRIPTION (OPTIONAL)</label>
            <textarea
              id="flagDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what functionality this flag controls and who owns it."
              className="new-flag-textarea"
              disabled={isLoading}
            />
          </div>

          <div className="new-flag-actions-row">
            <Link to="/app/features" className="new-flag-cancel-btn">
              Cancel
            </Link>
            <button
              type="submit"
              className="new-flag-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating flag...' : 'Create Feature Flag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
