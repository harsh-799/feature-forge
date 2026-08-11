import { useState } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router-dom'
import { FiArrowLeft, FiZap } from 'react-icons/fi'
import { createFeature } from '../api/featureApi'
import { getErrorMessage } from '../api/authApi'
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

      <div className="new-flag-split-card">
        {/* Left Side: Form */}
        <div className="new-flag-form-section">
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
                {isLoading ? 'Creating...' : 'Create Feature Flag'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Live Preview */}
        <div className="new-flag-preview-section">
          <span className="preview-section-title">FLAG PREVIEW</span>
          <div className="live-preview-card">
            <div className="preview-card-header">
              <div className="preview-header-left">
                <FiZap size={14} className="icon-orange" />
                <span className="preview-flag-key">
                  <code>{name.trim() ? getGeneratedKey(name) : 'FLAG_KEY_PREVIEW'}</code>
                </span>
              </div>
              <span className="preview-badge status-dev">DEVELOPMENT</span>
            </div>

            <div className="preview-card-body">
              <div className="preview-name-display">
                <h3>{name.trim() || 'Untitled Feature Flag'}</h3>
                <p className="preview-desc-text">
                  {description.trim() || 'No description provided yet.'}
                </p>
              </div>

              <div className="preview-divider"></div>

              {/* Evaluation State (disabled/grey toggle) */}
              <div className="preview-row">
                <span className="preview-label">Evaluation State</span>
                <div className="preview-toggle-pill">
                  <span className="preview-toggle-label">OFF</span>
                  <div className="preview-toggle-thumb"></div>
                </div>
              </div>

              {/* Rollout slider (0% target) */}
              <div className="preview-slider-container">
                <div className="preview-slider-label-row">
                  <span className="preview-label">Rollout Target</span>
                  <span className="preview-slider-percentage">0%</span>
                </div>
                <div className="preview-slider-track-wrap">
                  <div className="preview-slider-track">
                    <div className="preview-slider-fill" style={{ width: '0%' }}></div>
                    <div className="preview-slider-thumb" style={{ left: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
