import { 
  FiArrowRight, 
  FiZap, 
  FiTarget, 
  FiSliders, 
  FiActivity, 
  FiRefreshCw 
} from 'react-icons/fi'
import './HowItWorks.css'

export default function HowItWorks() {
  return (
    <section className="workflow-section" id="how-it-works">
      <div className="section-container">
        <div className="section-header reveal-on-scroll">
          <span className="section-subtitle-tag">Workflow</span>
          <h2 className="section-title">How FeatureForge Works</h2>
          <p className="section-description">
            Safely release features from development to production without redeploying applications.
          </p>
        </div>

        <div className="workflow-steps reveal-on-scroll">
          {/* Step 1 */}
          <div className="workflow-card-wrap">
            <div className="workflow-card">
              <div className="workflow-card-header">
                <div className="workflow-card-icon-circle">
                  <FiZap size={16} />
                </div>
                <span className="workflow-step-num">Step 01</span>
              </div>
              <h3 className="workflow-step-title">Create Feature Flag</h3>
              <p className="workflow-step-desc">Define a feature key and control whether the feature is enabled.</p>
              
              <div className="mini-ui-snippet flag-creator-snippet">
                <div className="mini-ui-header">
                  <span className="ui-circle red"></span>
                  <span className="ui-circle yellow"></span>
                  <span className="ui-circle green"></span>
                </div>
                <div className="mini-ui-body">
                  <div className="ui-form-group">
                    <span className="ui-label">Flag Key</span>
                    <span className="ui-valuecode">NEW_CHECKOUT</span>
                  </div>
                  <div className="ui-form-group">
                    <span className="ui-label">Environment</span>
                    <span className="ui-badge-staged">Production</span>
                  </div>
                  <div className="ui-form-group-row">
                    <span className="ui-label">Status</span>
                    <div className="mini-switch-pill active">
                      <div className="mini-switch-thumb"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="workflow-arrow-connector">
            <FiArrowRight size={18} className="arrow-desktop" />
          </div>

          {/* Step 2 */}
          <div className="workflow-card-wrap">
            <div className="workflow-card">
              <div className="workflow-card-header">
                <div className="workflow-card-icon-circle">
                  <FiTarget size={16} />
                </div>
                <span className="workflow-step-num">Step 02</span>
              </div>
              <h3 className="workflow-step-title">Connect Your Application</h3>
              <p className="workflow-step-desc">Integrate FeatureForge using the REST API or Java SDK.</p>

              <div className="mini-ui-snippet targeting-snippet">
                <div className="mini-ui-header">
                  <span className="ui-header-title">Connection SDK</span>
                </div>
                <div className="mini-ui-body">
                  <div className="ui-target-rule">
                    <span className="rule-field">Language</span>
                    <span className="rule-operator">=</span>
                    <span className="rule-badge">Java SDK</span>
                  </div>
                  <div className="ui-rule-operator">OR</div>
                  <div className="ui-target-rule">
                    <span className="rule-field">Interface</span>
                    <span className="rule-operator">=</span>
                    <span className="rule-badge">REST API</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="workflow-arrow-connector">
            <FiArrowRight size={18} className="arrow-desktop" />
          </div>

          {/* Step 3 */}
          <div className="workflow-card-wrap">
            <div className="workflow-card">
              <div className="workflow-card-header">
                <div className="workflow-card-icon-circle">
                  <FiSliders size={16} />
                </div>
                <span className="workflow-step-num">Step 03</span>
              </div>
              <h3 className="workflow-step-title">Evaluate the Feature</h3>
              <p className="workflow-step-desc">Check whether a feature is enabled for a specific user.</p>

              <div className="mini-ui-snippet rollout-snippet">
                <div className="mini-ui-header">
                  <span className="ui-header-title">Evaluate Flag</span>
                  <span className="ui-rollout-percent" style={{ color: 'var(--accent)' }}>Active</span>
                </div>
                <div className="mini-ui-body">
                  <div className="ui-form-group">
                    <span className="ui-label">User Identifier</span>
                    <span className="ui-valuecode">user_1048</span>
                  </div>
                  <div className="ui-form-group-row">
                    <span className="ui-label">Serve Feature</span>
                    <span className="ui-badge-staged">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="workflow-arrow-connector">
            <FiArrowRight size={18} className="arrow-desktop" />
          </div>

          {/* Step 4 */}
          <div className="workflow-card-wrap">
            <div className="workflow-card">
              <div className="workflow-card-header">
                <div className="workflow-card-icon-circle">
                  <FiActivity size={16} />
                </div>
                <span className="workflow-step-num">Step 04</span>
              </div>
              <h3 className="workflow-step-title">Control Feature State</h3>
              <p className="workflow-step-desc">Enable or disable features instantly from the FeatureForge dashboard.</p>

              <div className="mini-ui-snippet monitor-snippet">
                <div className="mini-ui-header">
                  <span className="ui-header-title">Dashboard Toggle</span>
                  <span className="ui-live-dot" style={{ backgroundColor: 'var(--accent)' }}></span>
                </div>
                <div className="mini-ui-body">
                  <div className="ui-form-group-row">
                    <span className="ui-label">Dashboard Switch</span>
                    <div className="mini-switch-pill active">
                      <div className="mini-switch-thumb"></div>
                    </div>
                  </div>
                  <div className="ui-metric-row">
                    <span className="ui-metric-label">Status State</span>
                    <span className="ui-metric-val" style={{ color: '#2F9254' }}>ON (Active)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="workflow-arrow-connector">
            <FiArrowRight size={18} className="arrow-desktop" />
          </div>

          {/* Step 5 */}
          <div className="workflow-card-wrap">
            <div className="workflow-card">
              <div className="workflow-card-header">
                <div className="workflow-card-icon-circle">
                  <FiRefreshCw size={16} />
                </div>
                <span className="workflow-step-num">Step 05</span>
              </div>
              <h3 className="workflow-step-title">Ship Without Redeploying</h3>
              <p className="workflow-step-desc">Change feature behavior instantly without changing or redeploying your application.</p>

              <div className="mini-ui-snippet rollback-snippet">
                <div className="mini-ui-header">
                  <span className="ui-header-title">Live Update</span>
                </div>
                <div className="mini-ui-body">
                  <div className="killswitch-row">
                    <span className="killswitch-label">Deployments</span>
                    <span className="ui-metric-val">0 changes</span>
                  </div>
                  <div className="rollback-status-text" style={{ color: '#2F9254' }}>No Redeploy</div>
                  <div className="rollback-meta-badge">Instant Sync</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
