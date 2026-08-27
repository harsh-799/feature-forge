import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { FiCopy, FiCheck, FiChevronDown, FiChevronUp, FiInfo, FiAlertTriangle, FiBookOpen } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Documentation.css';

// Documentation Section IDs and Labels
const SECTIONS = [
  { id: 'intro', label: 'Introduction & Concept' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'feature-flags', label: 'Feature Flags' },
  { id: 'environments', label: 'Environments' },
  { id: 'feature-exposure', label: 'Feature Exposure' },
  { id: 'controlled-rollouts', label: 'Controlled Rollouts' },
  { id: 'realtime-evaluation', label: 'Real-time Evaluation' },
  { id: 'kill-switch', label: 'Kill Switch & Rollback' },
  { id: 'audit-logs', label: 'Audit Logs' },
  { id: 'java-sdk', label: 'Java SDK' },
  { id: 'api-reference', label: 'API Reference' }
];

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('intro');
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const [copiedBlock, setCopiedBlock] = useState(null); // stores code block key
  
  // Section refs for scroll spying
  const sectionRefs = useRef({});

  // Smooth scroll to target section
  const handleScrollToSection = (sectionId) => {
    setIsMobileTocOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  // Setup ScrollSpy with IntersectionObserver
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-120px 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Setup reveal on scroll animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Copy code utility
  const handleCopyText = (codeText, blockId) => {
    navigator.clipboard.writeText(codeText)
      .then(() => {
        setCopiedBlock(blockId);
        toast.success('Code copied to clipboard!');
        setTimeout(() => setCopiedBlock(null), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy code.');
      });
  };

  return (
    <div className="docs-page-container">
      <Navbar />

      <div className="docs-main-layout">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className={`docs-sidebar ${isMobileTocOpen ? 'expanded' : ''}`}>
          <button 
            className="docs-mobile-toc-toggle" 
            onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
          >
            <span>Table of Contents: <strong>{SECTIONS.find(s => s.id === activeSection)?.label}</strong></span>
            {isMobileTocOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>

          <div className="docs-sidebar-sticky">
            <h4 className="docs-nav-title">Developer Guides</h4>
            <ul className="docs-nav-list">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <button
                    className={`docs-nav-link-btn ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => handleScrollToSection(section.id)}
                  >
                    <span>{section.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* MAIN DOCUMENTATION CONTENT */}
        <main className="docs-content-area">
          
          {/* SECTION 1: INTRODUCTION & CONCEPT */}
          <section id="intro" className="docs-section">
            <h1 className="docs-title">Introduction & Concept</h1>
            <p className="docs-p">
              FeatureForge is a feature flag and controlled rollout platform that separates deploying code from releasing features. Deploy your code once, then control when and where a feature becomes available without redeploying.
            </p>

            <h3 className="docs-subtitle">What FeatureForge Is vs. Is Not</h3>
            <p className="docs-p">
              It is important to understand the boundary between your deployment systems and FeatureForge:
            </p>
            <ul className="docs-ul">
              <li className="docs-li">
                <strong>FeatureForge is NOT a deployment platform:</strong> It does not handle building artifacts, updating cloud infrastructure, container orchestration, or performing Git operations.
              </li>
              <li className="docs-li">
                <strong>FeatureForge is an exposure controller:</strong> Your deployment systems handle shipping the application bytes to your environments. FeatureForge evaluates whether a feature is enabled for a given request.
              </li>
            </ul>

            <div className="docs-diagram-box">
              <div className="docs-flow">
                <div className="docs-flow-step">CI/CD Pipeline</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step">Deploy Application Code</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step accent">FeatureForge Exposure Control</div>
              </div>
            </div>

            <h3 className="docs-subtitle">Deployment vs. Release Lifecycle</h3>
            <p className="docs-p">
              By wrapping new features in runtime evaluations, you can decouple shipping code from exposing functionality.
            </p>

            <div className="docs-comparison-grid">
              <div className="docs-comparison-card">
                <h4 className="docs-comparison-title">Traditional Releases</h4>
                <div className="docs-comparison-flow">
                  <div className="docs-comparison-step">Merge New Code</div>
                  <div className="docs-comparison-arrow">↓</div>
                  <div className="docs-comparison-step">Build & Deploy</div>
                  <div className="docs-comparison-arrow">↓</div>
                  <div className="docs-comparison-step">100% Users Exposed After Deployment</div>
                  <div className="docs-comparison-arrow">↓</div>
                  <div className="docs-comparison-step">Bugs require redeployment rollback</div>
                </div>
              </div>

              <div className="docs-comparison-card">
                <h4 className="docs-comparison-title">FeatureForge Releases</h4>
                <div className="docs-comparison-flow">
                  <div className="docs-comparison-step">Merge flag-conditioned code</div>
                  <div className="docs-comparison-arrow">↓</div>
                  <div className="docs-comparison-step">Build & Deploy</div>
                  <div className="docs-comparison-arrow">↓</div>
                  <div className="docs-comparison-step">0% Users Exposed Initially</div>
                  <div className="docs-comparison-arrow">↓</div>
                  <div className="docs-comparison-step">Tweak exposure percentage dynamically</div>
                </div>
              </div>
            </div>

            <h3 className="docs-subtitle">Where FeatureForge Fits</h3>
            <p className="docs-p">
              The platform operates as a centralized decision broker in your service architecture:
            </p>
            <div className="docs-diagram-box" style={{ background: '#FFFDF9' }}>
              <div className="docs-flow">
                <div className="docs-flow-step">Your Application</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step accent">Feature Flag Check</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step">FeatureForge Service</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step accent">Flag Evaluation</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step">Enabled / Disabled</div>
              </div>
            </div>
          </section>

          {/* SECTION 2: HOW IT WORKS */}
          <section id="how-it-works" className="docs-section">
            <h2 className="docs-title">How FeatureForge Works</h2>
            <p className="docs-p">
              When a client application checks a feature flag, it makes a lightweight request containing the target flag identifier key and the unique identifier of the active user. FeatureForge validates the request, inspects the active environment state, computes the rollout assignment, and returns a binary evaluation state.
            </p>

            <div className="docs-diagram-box">
              <div className="docs-flow">
                <div className="docs-flow-step">Client Application</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step accent">Query /evaluate</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step">Validate X-API-Key</div>
              </div>
              <div className="docs-flow">
                <div className="docs-flow-step">Compute User Hash</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step">Check environment limits</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step accent">Response: enabled true/false</div>
              </div>
            </div>
          </section>

          {/* SECTION 3: GETTING STARTED */}
          <section id="getting-started" className="docs-section">
            <h2 className="docs-title">Getting Started</h2>
            <p className="docs-p">
              To evaluate your first feature flag using FeatureForge, complete the following sequential workflow:
            </p>
            <ul className="docs-ul">
              <li className="docs-li"><strong>1. Initialize a Workspace:</strong> Create a workspace during onboarding to organize your environments and keys.</li>
              <li className="docs-li"><strong>2. Create a Feature Flag:</strong> Navigate to the <em>Features</em> page and create a flag with a unique key (e.g., <code>INDEPENDENCE_DAY_HERO</code>).</li>
              <li className="docs-li"><strong>3. Retrieve API Keys:</strong> Go to the <em>Environments</em> page and copy the API key for your target environment (Development, Staging, or Production).</li>
              <li className="docs-li"><strong>4. Integrate SDK or API:</strong> Integrate the FeatureForge Java SDK (or use direct HTTP endpoints) inside your application code.</li>
              <li className="docs-li"><strong>5. Request Evaluation:</strong> Invoke evaluation checks dynamically based on the active user identity.</li>
            </ul>
          </section>

          {/* SECTION 4: FEATURE FLAGS */}
          <section id="feature-flags" className="docs-section">
            <h2 className="docs-title">Feature Flags</h2>
            <p className="docs-p">
              A feature flag is a configuration toggle mapped to a unique identifier key. Instead of deploy-time variables, flags are queried at runtime to branch execution logic safely:
            </p>

            <div className="docs-code-container">
              <div className="docs-code-header">
                <span className="docs-code-filename">Application Check</span>
                <button 
                  className={`docs-copy-btn ${copiedBlock === 'code-flag' ? 'copied' : ''}`}
                  onClick={() => handleCopyText(
`boolean enabled = client.isEnabled("INDEPENDENCE_DAY_HERO", "user123");
if (enabled) {
    renderNewHeroHeader();
} else {
    renderLegacyHeroHeader();
}`, 'code-flag')}
                >
                  {copiedBlock === 'code-flag' ? <FiCheck /> : <FiCopy />}
                  {copiedBlock === 'code-flag' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="docs-code-body">
                <pre>
                  <code>
                    <span className="keyword">boolean</span> enabled = client.<span className="method">isEnabled</span>(<span className="string">"INDEPENDENCE_DAY_HERO"</span>, <span className="string">"user123"</span>);<br /><br />
                    <span className="keyword">if</span> (enabled) &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="method">renderNewHeroHeader</span>();<br />
                    &#125; <span className="keyword">else</span> &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="method">renderLegacyHeroHeader</span>();<br />
                    &#125;
                  </code>
                </pre>
              </div>
            </div>

            <h3 className="docs-subtitle">Feature Flag Lifecycle & Retirement</h3>
            <p className="docs-p">
              Temporary release flags should be retired once the feature is fully rolled out and proven stable. Note that not every feature flag is temporary: operational flags (such as configuration switches or logging controls) can remain permanent components of your system.
            </p>

            <div className="docs-diagram-box" style={{ background: '#FFFDF9' }}>
              <div className="docs-flow">
                <div className="docs-flow-step">Create Flag</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step">Develop Behind Flag</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step">Deploy Code</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step accent">Gradual Rollout</div>
              </div>
              <div className="docs-flow" style={{ marginTop: '12px' }}>
                <div className="docs-flow-step">Verify Stability</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step accent">100% Rollout</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step">Retire Flag Check</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step">Remove Old Code</div>
              </div>
            </div>

            <h4 className="docs-subtitle" style={{ fontSize: '15px' }}>Why Cleanup Matters</h4>
            <p className="docs-p">
              Leaving retired feature flags in your codebase indefinitely creates technical debt:
            </p>
            <ul className="docs-ul">
              <li className="docs-li"><strong>Dead Code Paths:</strong> Obsolete logic remains in the application, making it harder to reason about behavior.</li>
              <li className="docs-li"><strong>Cognitive Overhead:</strong> Developers must work around and understand unused flags.</li>
              <li className="docs-li"><strong>Complex Conditionals:</strong> Nested or overlapping flags create increasingly complicated branch logic.</li>
            </ul>

            <h4 className="docs-subtitle" style={{ fontSize: '15px' }}>Code Cleanup Example</h4>
            <p className="docs-p">
              Once the feature is fully rolled out and you are confident that the new behavior is stable, remove the flag evaluation checks and obsolete code paths.
            </p>

            <div className="docs-comparison-grid">
              <div className="docs-comparison-card">
                <h4 className="docs-comparison-title">Before Cleanup (Conditional)</h4>
                <div className="docs-code-container" style={{ margin: '0' }}>
                  <div className="docs-code-body" style={{ padding: '12px' }}>
                    <pre><code>
                      <span className="keyword">if</span> (client.<span className="method">isEnabled</span>(<span className="string">"new-dashboard"</span>, userId)) &#123;<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">return</span> <span className="method">newDashboard</span>();<br />
                      &#125; <span className="keyword">else</span> &#123;<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">return</span> <span className="method">oldDashboard</span>();<br />
                      &#125;
                    </code></pre>
                  </div>
                </div>
              </div>

              <div className="docs-comparison-card">
                <h4 className="docs-comparison-title">After Cleanup (Permanent)</h4>
                <div className="docs-code-container" style={{ margin: '0' }}>
                  <div className="docs-code-body" style={{ padding: '12px' }}>
                    <pre><code>
                      <span className="keyword">return</span> <span className="method">newDashboard</span>();
                    </code></pre>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="docs-p" style={{ marginTop: '20px' }}>
              <strong>Retirement Sequence:</strong> First, clean up the codebase by removing the flag check and obsolete code path. Only after the modified application has been successfully deployed and verified should you delete the corresponding flag configuration from the FeatureForge dashboard to keep your workspace tidy.
            </p>
          </section>

          {/* SECTION 5: ENVIRONMENTS */}
          <section id="environments" className="docs-section">
            <h2 className="docs-title">Environments</h2>
            <p className="docs-p">
              FeatureForge provides isolated environments to match your team's software delivery pipeline. Configurations are entirely independent across environments:
            </p>
            <ul className="docs-ul">
              <li className="docs-li"><strong>Development:</strong> Sandbox environment. When a flag is active, it evaluates to <code>true</code> for 100% of requests.</li>
              <li className="docs-li"><strong>Staging / QA:</strong> Testing scope. Activating the flag here exposes the feature immediately to testing scopes.</li>
              <li className="docs-li"><strong>Production:</strong> The live environment. Here, progressive rollout percentage and hashing rule parameters are used to scale exposure safely.</li>
            </ul>
          </section>

          {/* SECTION 6: FEATURE EXPOSURE */}
          <section id="feature-exposure" className="docs-section">
            <h2 className="docs-title">Feature Exposure</h2>
            <p className="docs-p">
              FeatureForge evaluates flag states and progressive percentages inside the environment scopes mapped to your API keys. Arbitrary user attributes, custom operators, or custom targeting rules are not supported in the current release. Exposure is determined strictly by:
            </p>
            <ul className="docs-ul">
              <li className="docs-li">
                <strong>Environment Specific State:</strong> Whether the flag configuration is toggled on (Enabled) or off (Disabled) inside the target environment.
              </li>
              <li className="docs-li">
                <strong>Progressive Rollout:</strong> In Production, features can be limited to a percentage subset of traffic using a hashing algorithm on the user identifier.
              </li>
            </ul>
          </section>

          {/* SECTION 7: CONTROLLED ROLLOUTS */}
          <section id="controlled-rollouts" className="docs-section">
            <h2 className="docs-title">Controlled Rollouts</h2>
            <p className="docs-p">
              To mitigate deployment risk, FeatureForge supports progressive exposure percentages on the Production environment. Instead of releasing to 100% of users instantly, you can scale exposure dynamically:
            </p>

            <div className="docs-diagram-box" style={{ background: '#FAF8F3' }}>
              <div className="docs-flow">
                <div className="docs-flow-step accent">1% (Canary)</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step accent">10%</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step accent">25%</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step accent">50%</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step">100% (GA)</div>
              </div>
            </div>

            <p className="docs-p">
              Exposure checks are deterministic. FeatureForge groups requests into buckets based on the hashing configuration of the user identifier. This guarantees that a specific user gets a consistent experience (always seeing either the new feature or the legacy version) unless you adjust the rollout percentage upward.
            </p>
          </section>

          {/* SECTION 8: REAL-TIME EVALUATION */}
          <section id="realtime-evaluation" className="docs-section">
            <h2 className="docs-title">Real-time Evaluation</h2>
            <p className="docs-p">
              The evaluation logic calculates the rollout bucket deterministically on the backend during the API call. 
            </p>
            <p className="docs-p">
              The backend retrieves the feature configuration and uses a hash-based allocation algorithm:
            </p>
            <div className="docs-code-container">
              <div className="docs-code-header">
                <span className="docs-code-filename">Evaluation Core Logic</span>
              </div>
              <div className="docs-code-body">
                <pre>
                  <code>
                    <span className="comment">// User identifier and flag key concatenated</span><br />
                    String userFeatureKey = userIdentifier + featureKey;<br /><br />
                    <span className="comment">// Compute hash code</span><br />
                    <span className="keyword">int</span> evaluationHash = userFeatureKey.hashCode();<br /><br />
                    <span className="comment">// Bucket user into 0-99 range</span><br />
                    <span className="keyword">int</span> bucket = Math.floorMod(evaluationHash, 100);<br /><br />
                    <span className="comment">// User is exposed if bucket index falls below rollout target percentage</span><br />
                    <span className="keyword">return</span> bucket &lt; rolloutPercentage;<br />
                  </code>
                </pre>
              </div>
            </div>
          </section>

          {/* SECTION 9: KILL SWITCH & ROLLBACK */}
          <section id="kill-switch" className="docs-section">
            <h2 className="docs-title">Kill Switch & Rollback</h2>
            <p className="docs-p">
              If telemetry monitors indicate errors, exceptions, or database load spike after releasing a flag, you can immediately rollback.
            </p>
            <p className="docs-p">
              Disabling the flag configuration on the FeatureForge dashboard overrides all progressive rollouts and returns <code>enabled: false</code> to all API queries instantly. No recompilation, git merges, CI/CD pipeline triggers, or container restarts are required.
            </p>
            <div className="docs-callout" style={{ backgroundColor: '#FFFDF5', borderColor: '#EAB308' }}>
              <FiAlertTriangle className="docs-callout-icon" style={{ color: '#EAB308' }} size={18} />
              <div className="docs-callout-content">
                <strong>Attention:</strong> FeatureForge manages software runtime execution paths. It does not control server deployments or perform infrastructure rollbacks.
              </div>
            </div>
          </section>

          {/* SECTION 10: AUDIT LOGS */}
          <section id="audit-logs" className="docs-section">
            <h2 className="docs-title">Audit Logs</h2>
            <p className="docs-p">
              FeatureForge tracks all configuration changes to provide full traceability for compliance and debugging. Audit entries record:
            </p>
            <ul className="docs-ul">
              <li className="docs-li"><strong>Operator:</strong> The email and full name of the team member who performed the action.</li>
              <li className="docs-li"><strong>Action Details:</strong> The exact operation performed (e.g. promoting flags, updating rollout target, or disabling switches).</li>
              <li className="docs-li"><strong>Context Info:</strong> Target workspace, affected environment name, and timestamps.</li>
            </ul>
            <p className="docs-p">
              Logs can be viewed inside the <em>Activity History</em> panel on the dashboard.
            </p>
          </section>

          {/* SECTION 11: JAVA SDK */}
          <section id="java-sdk" className="docs-section">
            <h2 className="docs-title">Java SDK</h2>
            <p className="docs-p">
              The FeatureForge Java SDK provides a lightweight Java client for evaluating feature flags from Java applications without manually handling HTTP requests or API authentication.
            </p>
            
            <p className="docs-p">
              The SDK handles:
            </p>
            <ul className="docs-ul">
              <li className="docs-li">HTTP request serialization and parsing.</li>
              <li className="docs-li">API-key authentication (<code>X-API-Key</code>).</li>
              <li className="docs-li">JSON serialization/deserialization.</li>
              <li className="docs-li">HTTP error code propagation.</li>
            </ul>

            <div className="docs-callout">
              <FiInfo className="docs-callout-icon" size={18} />
              <div className="docs-callout-content">
                <strong>Evaluation Responsibility:</strong> The rollout and evaluation logic remains on the FeatureForge backend. The SDK acts as a lightweight HTTP communication client.
              </div>
            </div>

            <div className="docs-diagram-box">
              <div className="docs-flow">
                <div className="docs-flow-step">Java Application</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step accent">FeatureForgeClient</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step">POST /api/v1/evaluate + X-API-Key</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step accent">FeatureForge Backend</div>
                <div className="docs-flow-arrow">→</div>
                <div className="docs-flow-step">true / false</div>
              </div>
            </div>

            <h3 className="docs-subtitle">Requirements</h3>
            <ul className="docs-ul">
              <li className="docs-li">Java 21+</li>
              <li className="docs-li">Maven build configuration</li>
              <li className="docs-li">FeatureForge environment API key</li>
              <li className="docs-li">Access to a running FeatureForge backend</li>
            </ul>

            <h3 className="docs-subtitle">Installation</h3>
            <p className="docs-p">
              Install the SDK JAR into your local Maven repository:
            </p>
            
            <div className="docs-code-container">
              <div className="docs-code-header">
                <span className="docs-code-filename">Terminal</span>
                <button 
                  className={`docs-copy-btn ${copiedBlock === 'sdk-install' ? 'copied' : ''}`}
                  onClick={() => handleCopyText(
`mvn install:install-file \\
  -Dfile=featureforge-sdk-1.0.0.jar \\
  -DgroupId=com.featureforge \\
  -DartifactId=featureforge-sdk \\
  -Dversion=1.0.0 \\
  -Dpackaging=jar`, 'sdk-install')}
                >
                  {copiedBlock === 'sdk-install' ? <FiCheck /> : <FiCopy />}
                  {copiedBlock === 'sdk-install' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="docs-code-body">
                <pre>
                  <code>
                    mvn install:install-file \<br />
                    &nbsp;&nbsp;-Dfile=featureforge-sdk-1.0.0.jar \<br />
                    &nbsp;&nbsp;-DgroupId=com.featureforge \<br />
                    &nbsp;&nbsp;-DartifactId=featureforge-sdk \<br />
                    &nbsp;&nbsp;-Dversion=1.0.0 \<br />
                    &nbsp;&nbsp;-Dpackaging=jar
                  </code>
                </pre>
              </div>
            </div>

            <p className="docs-p">
              Add the SDK as a dependency in your project's <code>pom.xml</code>:
            </p>

            <div className="docs-code-container">
              <div className="docs-code-header">
                <span className="docs-code-filename">pom.xml</span>
                <button 
                  className={`docs-copy-btn ${copiedBlock === 'sdk-dep' ? 'copied' : ''}`}
                  onClick={() => handleCopyText(
`<dependency>
    <groupId>com.featureforge</groupId>
    <artifactId>featureforge-sdk</artifactId>
    <version>1.0.0</version>
</dependency>`, 'sdk-dep')}
                >
                  {copiedBlock === 'sdk-dep' ? <FiCheck /> : <FiCopy />}
                  {copiedBlock === 'sdk-dep' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="docs-code-body">
                <pre>
                  <code>
                    <span className="keyword">&lt;dependency&gt;</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">&lt;groupId&gt;</span>com.featureforge<span className="keyword">&lt;/groupId&gt;</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">&lt;artifactId&gt;</span>featureforge-sdk<span className="keyword">&lt;/artifactId&gt;</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">&lt;version&gt;</span>1.0.0<span className="keyword">&lt;/version&gt;</span><br />
                    <span className="keyword">&lt;/dependency&gt;</span>
                  </code>
                </pre>
              </div>
            </div>

            <h3 className="docs-subtitle">Basic Usage</h3>
            <p className="docs-p">
              Initialize the client with your environment API Key and backend URL:
            </p>

            <div className="docs-code-container">
              <div className="docs-code-header">
                <span className="docs-code-filename">Example.java</span>
                <button 
                  className={`docs-copy-btn ${copiedBlock === 'sdk-usage' ? 'copied' : ''}`}
                  onClick={() => handleCopyText(
`import com.featureforge.sdk.FeatureForgeClient;

public class Example {
    public static void main(String[] args) {
        FeatureForgeClient client = new FeatureForgeClient(
            "YOUR_API_KEY",
            "YOUR_FEATUREFORGE_BACKEND_URL"
        );

        boolean enabled = client.isEnabled(
            "INDEPENDENCE_DAY_HERO",
            "user123"
        );
        System.out.println("Feature enabled: " + enabled);
    }
}`, 'sdk-usage')}
                >
                  {copiedBlock === 'sdk-usage' ? <FiCheck /> : <FiCopy />}
                  {copiedBlock === 'sdk-usage' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="docs-code-body">
                <pre>
                  <code>
                    <span className="keyword">import</span> com.featureforge.sdk.FeatureForgeClient;<br /><br />
                    <span className="keyword">public class</span> <span className="type">Example</span> &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">public static void</span> <span className="method">main</span>(String[] args) &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="type">FeatureForgeClient</span> client = <span className="keyword">new</span> <span className="type">FeatureForgeClient</span>(<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="string">"YOUR_API_KEY"</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="string">"YOUR_FEATUREFORGE_BACKEND_URL"</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;);<br /><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">boolean</span> enabled = client.<span className="method">isEnabled</span>(<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="string">"INDEPENDENCE_DAY_HERO"</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="string">"user123"</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;);<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="type">System</span>.out.<span className="method">println</span>(<span className="string">"Feature enabled: "</span> + enabled);<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                    &#125;
                  </code>
                </pre>
              </div>
            </div>

            <h3 className="docs-subtitle">Error & Exception Handling</h3>
            <p className="docs-p">
              If feature evaluation fails (e.g. backend down or invalid credentials), the SDK throws a <code>FeatureForgeException</code>:
            </p>

            <div className="docs-code-container">
              <div className="docs-code-header">
                <span className="docs-code-filename">ErrorHandling.java</span>
                <button 
                  className={`docs-copy-btn ${copiedBlock === 'sdk-error' ? 'copied' : ''}`}
                  onClick={() => handleCopyText(
`import com.featureforge.sdk.FeatureForgeClient;
import com.featureforge.sdk.exception.FeatureForgeException;

try {
    boolean enabled = client.isEnabled(
        "INDEPENDENCE_DAY_HERO",
        "user123"
    );
} catch (FeatureForgeException e) {
    System.out.println("Evaluation failed.");
    System.out.println("Status: " + e.getStatusCode());
    System.out.println("Message: " + e.getMessage());
}`, 'sdk-error')}
                >
                  {copiedBlock === 'sdk-error' ? <FiCheck /> : <FiCopy />}
                  {copiedBlock === 'sdk-error' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="docs-code-body">
                <pre>
                  <code>
                    <span className="keyword">import</span> com.featureforge.sdk.FeatureForgeClient;<br />
                    <span className="keyword">import</span> com.featureforge.sdk.exception.FeatureForgeException;<br /><br />
                    <span className="keyword">try</span> &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">boolean</span> enabled = client.<span className="method">isEnabled</span>(<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="string">"INDEPENDENCE_DAY_HERO"</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="string">"user123"</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;);<br />
                    &#125; <span className="keyword">catch</span> (<span className="type">FeatureForgeException</span> e) &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="type">System</span>.out.<span className="method">println</span>(<span className="string">"Evaluation failed."</span>);<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="type">System</span>.out.<span className="method">println</span>(<span className="string">"Status: "</span> + e.<span className="method">getStatusCode</span>());<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="type">System</span>.out.<span className="method">println</span>(<span className="string">"Message: "</span> + e.<span className="method">getMessage</span>());<br />
                    &#125;
                  </code>
                </pre>
              </div>
            </div>

            <div className="docs-callout" style={{ backgroundColor: '#FFFDF5', borderColor: '#EAB308' }}>
              <FiInfo className="docs-callout-icon" style={{ color: '#EAB308' }} size={18} />
              <div className="docs-callout-content">
                <strong>Important Distinction:</strong> A <code>false</code> result returned by the SDK is a valid feature evaluation output (meaning the flag is currently disabled or the user is not included in the progressive rollout group). It does not represent an error.
              </div>
            </div>
          </section>

          {/* SECTION 12: API REFERENCE */}
          <section id="api-reference" className="docs-section">
            <h2 className="docs-title">API Reference</h2>
            <p className="docs-p">
              Evaluate feature configurations programmatically using the public evaluation endpoint.
            </p>

            <h3 className="docs-subtitle">
              <span className="docs-badge post" style={{ marginRight: '8px' }}>POST</span>
              <code>/api/v1/evaluate</code>
            </h3>
            <p className="docs-p" style={{ marginTop: '8px' }}>
              Evaluates if a given feature flag key is active for the specified user and context.
            </p>

            <h4 className="docs-subtitle" style={{ fontSize: '15px' }}>Request Headers</h4>
            <div className="docs-table-wrapper">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Header Key</th>
                    <th>Type</th>
                    <th>Requirement</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>Content-Type</code></td>
                    <td>String</td>
                    <td><span className="docs-badge required">Required</span></td>
                    <td>Must be set to <code>application/json</code>.</td>
                  </tr>
                  <tr>
                    <td><code>X-API-Key</code></td>
                    <td>String</td>
                    <td><span className="docs-badge required">Required</span></td>
                    <td>The API key of the environment (copied from the Environments page).</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="docs-subtitle" style={{ fontSize: '15px' }}>Request Body Fields</h4>
            <div className="docs-table-wrapper">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>JSON Key</th>
                    <th>Type</th>
                    <th>Requirement</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>featureKey</code></td>
                    <td>String</td>
                    <td><span className="docs-badge required">Required</span></td>
                    <td>The unique identifier key of the flag (e.g. <code>NEW_CHECKOUT</code>). Can't be blank.</td>
                  </tr>
                  <tr>
                    <td><code>user</code></td>
                    <td>String</td>
                    <td><span className="docs-badge required">Required</span></td>
                    <td>The identifier of the user context (e.g., database ID, UUID, or email). Can't be blank. Used for progressive rollout hashing.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="docs-subtitle" style={{ fontSize: '15px' }}>Response Schema (200 OK)</h4>
            <div className="docs-table-wrapper">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>JSON Key</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>enabled</code></td>
                    <td>Boolean</td>
                    <td>Indicates whether the feature is exposed (<code>true</code>) or hidden (<code>false</code>).</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="docs-subtitle" style={{ fontSize: '15px' }}>Example Raw Request</h4>
            <div className="docs-code-container">
              <div className="docs-code-header">
                <span className="docs-code-filename">HTTP request</span>
              </div>
              <div className="docs-code-body">
                <pre>
                  <code>
                    POST /api/v1/evaluate HTTP/1.1<br />
                    Host: YOUR_FEATUREFORGE_BACKEND_URL<br />
                    Content-Type: application/json<br />
                    X-API-Key: ff_dev_3b901f4c718a2bc490d1<br /><br />
                    &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"featureKey": "INDEPENDENCE_DAY_HERO",<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"user": "user123"<br />
                    &#125;
                  </code>
                </pre>
              </div>
            </div>

            <h4 className="docs-subtitle" style={{ fontSize: '15px' }}>Example Successful Response</h4>
            <div className="docs-code-container">
              <div className="docs-code-header">
                <span className="docs-code-filename">JSON response (200 OK)</span>
              </div>
              <div className="docs-code-body">
                <pre>
                  <code>
                    &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"enabled": true<br />
                    &#125;
                  </code>
                </pre>
              </div>
            </div>

            <h4 className="docs-subtitle" style={{ fontSize: '15px' }}>Error Responses (400 Bad Request)</h4>
            <p className="docs-p">
              If the request fails validation (e.g. invalid API key, missing headers, or non-existent flag key), the backend responds with a <code>400 Bad Request</code> and validation error details:
            </p>
            <div className="docs-code-container">
              <div className="docs-code-header">
                <span className="docs-code-filename">JSON response (400 Bad Request)</span>
              </div>
              <div className="docs-code-body">
                <pre>
                  <code>
                    &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"success": false,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"message": "Invalid API key provided"<br />
                    &#125;
                  </code>
                </pre>
              </div>
            </div>
          </section>

        </main>
      </div>

      <Footer />
    </div>
  );
}
