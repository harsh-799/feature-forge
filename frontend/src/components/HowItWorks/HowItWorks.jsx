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
              <p className="workflow-step-desc">Define a new toggle key for your feature deployment.</p>
              
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
              <h3 className="workflow-step-title">Configure Targeting</h3>
              <p className="workflow-step-desc">Target specific users, regions, or roles selectively.</p>

              <div className="mini-ui-snippet targeting-snippet">
                <div className="mini-ui-header">
                  <span className="ui-header-title">Target Users</span>
                </div>
                <div className="mini-ui-body">
                  <div className="ui-target-rule">
                    <span className="rule-field">Country</span>
                    <span className="rule-operator">=</span>
                    <span className="rule-badge">India</span>
                  </div>
                  <div className="ui-rule-operator">AND</div>
                  <div className="ui-target-rule">
                    <span className="rule-field">User Role</span>
                    <span className="rule-operator">=</span>
                    <span className="rule-badge">Beta</span>
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
              <h3 className="workflow-step-title">Progressive Rollout</h3>
              <p className="workflow-step-desc">Scale delivery percentage incrementally.</p>

              <div className="mini-ui-snippet rollout-snippet">
                <div className="mini-ui-header">
                  <span className="ui-header-title">Rollout Allocation</span>
                  <span className="ui-rollout-percent">25%</span>
                </div>
                <div className="mini-ui-body">
                  <div className="mini-slider-track">
                    <div className="mini-slider-fill" style={{ width: '25%' }}></div>
                    <div className="mini-slider-thumb" style={{ left: '25%' }}></div>
                  </div>
                  <div className="mini-slider-ticks">
                    <span className="mini-tick active">10%</span>
                    <span className="mini-tick active">25%</span>
                    <span className="mini-tick">50%</span>
                    <span className="mini-tick">100%</span>
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
              <h3 className="workflow-step-title">Monitor Metrics</h3>
              <p className="workflow-step-desc">Track real-time evaluations, latency, and errors.</p>

              <div className="mini-ui-snippet monitor-snippet">
                <div className="mini-ui-header">
                  <span className="ui-header-title">Live Metrics</span>
                  <span className="ui-live-dot"></span>
                </div>
                <div className="mini-ui-body">
                  <div className="ui-metric-row">
                    <span className="ui-metric-label">Evaluations</span>
                    <span className="ui-metric-val">12.5k</span>
                  </div>
                  <div className="ui-metric-row">
                    <span className="ui-metric-label">Latency</span>
                    <span className="ui-metric-val green-text">1.2ms</span>
                  </div>
                  <div className="ui-metric-row">
                    <span className="ui-metric-label">Errors</span>
                    <span className="ui-metric-val">0.00%</span>
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
              <h3 className="workflow-step-title">Instant Rollback</h3>
              <p className="workflow-step-desc">Instantly disable a flag if issues are detected.</p>

              <div className="mini-ui-snippet rollback-snippet">
                <div className="mini-ui-header">
                  <span className="ui-header-title">Rollback Center</span>
                </div>
                <div className="mini-ui-body">
                  <div className="killswitch-row">
                    <span className="killswitch-label">Emergency Toggle</span>
                    <div className="mini-switch-pill disabled">
                      <div className="mini-switch-thumb"></div>
                    </div>
                  </div>
                  <div className="rollback-status-text">Feature Disabled</div>
                  <div className="rollback-meta-badge">No Deployment Required</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
