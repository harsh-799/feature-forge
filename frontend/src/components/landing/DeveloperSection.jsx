import './DeveloperSection.css'

export default function DeveloperSection() {
  return (
    <section className="dx-section" id="docs">
      <div className="dx-dark-container reveal-on-scroll">
        <div className="dx-grid">
          
          {/* Left Column: Code Editor */}
          <div className="dx-code-col">
            <div className="code-editor-window">
              <div className="editor-titlebar">
                <div className="editor-controls">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <span className="editor-filename">FeatureService.java</span>
              </div>
              <div className="editor-body">
                <pre className="code-content">
                  <code>
                    <span className="code-line"><span className="line-num">1</span> <span className="token-keyword">boolean</span> enabled = featureForge.<span className="token-method">isEnabled</span>(</span>
                    <span className="code-line"><span className="line-num">2</span>     <span className="token-string">"NEW_CHECKOUT"</span>,</span>
                    <span className="code-line"><span className="line-num">3</span>     user</span>
                    <span className="code-line"><span className="line-num">4</span> );</span>
                    <span className="code-line"><span className="line-num">5</span> </span>
                    <span className="code-line"><span className="line-num">6</span> <span className="token-keyword">if</span> (enabled) &#123;</span>
                    <span className="code-line"><span className="line-num">7</span>     <span className="token-method">renderNewCheckout</span>();</span>
                    <span className="code-line"><span className="line-num">8</span> &#125; <span className="token-keyword">else</span> &#123;</span>
                    <span className="code-line"><span className="line-num">9</span>     <span className="token-method">renderLegacyCheckout</span>();</span>
                    <span className="code-line"><span className="line-num">10</span> &#125;</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Right Column: Title and details */}
          <div className="dx-text-col">
            <span className="dx-subtitle">Developer SDK</span>
            <h2 className="dx-title">Built for Developers</h2>
            <p className="dx-description">
              Clean, type-safe APIs designed to fit seamlessly into your codebase with negligible latency.
            </p>

            <div className="dx-features-list">
              <div className="dx-feature-item">
                <span className="dx-item-badge">SDK</span>
                <div className="dx-item-content">
                  <h4 className="dx-item-title">Simple Integration</h4>
                  <p className="dx-item-desc">Integrate FeatureForge directly into your application using a clean SDK interface designed to keep feature flag checks simple and readable.</p>
                </div>
              </div>

              <div className="dx-feature-item">
                <span className="dx-item-badge">Dash</span>
                <div className="dx-item-content">
                  <h4 className="dx-item-title">Centralized Control</h4>
                  <p className="dx-item-desc">Manage feature states from the FeatureForge dashboard and change application behavior without modifying your existing code.</p>
                </div>
              </div>

              <div className="dx-feature-item">
                <span className="dx-item-badge">Java</span>
                <div className="dx-item-content">
                  <h4 className="dx-item-title">Java SDK</h4>
                  <p className="dx-item-desc">Type-safe SDK support for Java applications, with additional SDK integrations coming soon.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
