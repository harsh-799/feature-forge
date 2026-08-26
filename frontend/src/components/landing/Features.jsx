import { 
  FiSliders, 
  FiTarget, 
  FiServer, 
  FiCpu, 
  FiRotateCcw, 
  FiList 
} from 'react-icons/fi'
import './Features.css'

export default function Features() {
  return (
    <section className="features-section" id="features">
      <div className="section-container">
        <div className="section-header reveal-on-scroll">
          <span className="section-subtitle-tag">Features</span>
          <h2 className="section-title">Everything You Need to Ship Features Safely</h2>
        </div>

        <div className="features-grid reveal-on-scroll">
          
          {/* Feature 1 (Warm Cream) */}
          <div className="feature-card bg-cream">
            <div className="feature-card-inner">
              <div className="feature-icon-wrapper">
                <FiSliders size={20} className="feature-icon" />
              </div>
              <h3 className="feature-title">Progressive Rollouts</h3>
              <p className="feature-description">
                Gradually release flags to 1%, 10%, or 50% of users to analyze infrastructure performance before expanding scale.
              </p>
            </div>
          </div>

          {/* Feature 2 (Soft Beige) */}
          <div className="feature-card bg-beige">
            <div className="feature-card-inner">
              <div className="feature-icon-wrapper">
                <FiTarget size={20} className="feature-icon" />
              </div>
              <h3 className="feature-title">User Targeting</h3>
              <p className="feature-description">
                Define who can access a feature as you plan targeted releases.
              </p>
            </div>
          </div>

          {/* Feature 3 (Warm Cream) */}
          <div className="feature-card bg-cream">
            <div className="feature-card-inner">
              <div className="feature-icon-wrapper">
                <FiServer size={20} className="feature-icon" />
              </div>
              <h3 className="feature-title">Environment Management</h3>
              <p className="feature-description">
                Manage independent targeting rules and environment states for development, testing, staging, and production.
              </p>
            </div>
          </div>

          {/* Feature 4 (Soft Beige) */}
          <div className="feature-card bg-beige">
            <div className="feature-card-inner">
              <div className="feature-icon-wrapper">
                <FiCpu size={20} className="feature-icon" />
              </div>
              <h3 className="feature-title">Real-time Evaluation</h3>
              <p className="feature-description">
                Evaluate feature flags at runtime to determine whether a feature should be enabled.
              </p>
            </div>
          </div>

          {/* Feature 5 (Warm Cream) */}
          <div className="feature-card bg-cream">
            <div className="feature-card-inner">
              <div className="feature-icon-wrapper">
                <FiRotateCcw size={20} className="feature-icon" />
              </div>
              <h3 className="feature-title">Instant Rollback</h3>
              <p className="feature-description">
                If error thresholds spike, instantly toggle off features globally using our dashboard kill-switch with no redeploys.
              </p>
            </div>
          </div>

          {/* Feature 6 (Soft Beige) */}
          <div className="feature-card bg-beige">
            <div className="feature-card-inner">
              <div className="feature-icon-wrapper">
                <FiList size={20} className="feature-icon" />
              </div>
              <h3 className="feature-title">Audit Logs</h3>
              <p className="feature-description">
                Keep a complete, immutable system audit history of who changed which flag targets and when, maintaining security.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
