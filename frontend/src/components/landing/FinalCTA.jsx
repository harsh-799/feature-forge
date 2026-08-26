import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { handleNavLinkClick } from './scroll'
import './FinalCTA.css'

export default function FinalCTA() {
  const [ctaInView, setCtaInView] = useState(false);
  const [ctaRollout, setCtaRollout] = useState(0);
  const ctaCardRef = useRef(null);

  // Viewport trigger observer for rollout animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCtaInView(true);
      setCtaRollout(100);
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          setCtaInView(true);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (ctaCardRef.current) {
      observer.observe(ctaCardRef.current);
    }

    return () => {
      if (ctaCardRef.current) {
        observer.unobserve(ctaCardRef.current);
      }
    };
  }, []);

  // Rollout counter animation trigger
  useEffect(() => {
    if (!ctaInView) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCtaRollout(100);
      return;
    }

    let start = 0;
    const end = 100;
    const duration = 1200; // 1.2s to match visual rollout speed
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeVal = 1 - Math.pow(1 - progress, 3);
      setCtaRollout(Math.floor(easeVal * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 450); // Align number count start with sliding animations

    return () => clearTimeout(timeout);
  }, [ctaInView]);

  return (
    <section className="cta-section" id="get-started-section">
      <div className="section-container">
        <div className="cta-card reveal-on-scroll" ref={ctaCardRef}>
          <div className="cta-grid">
            
            {/* Left Column: Headline and Action */}
            <div className="cta-text-col">
              <span className="cta-eyebrow">READY WHEN YOU ARE</span>
              <h2 className="cta-title">
                Ship the code today.<br />
                Release the feature when you're ready.
              </h2>
              <p className="cta-description">
                Decouple feature releases from deployments and roll out changes with confidence.
              </p>
              <Link to="/signup" className="btn-get-started-pill cta-btn">
                <span className="btn-text-crop roll-up">
                  <span className="link-text-container">
                    <span className="link-text-primary">Get Started <FiArrowRight size={15} style={{ marginLeft: '4px', verticalAlign: 'middle' }} /></span>
                    <span className="link-text-secondary">Get Started <FiArrowRight size={15} style={{ marginLeft: '4px', verticalAlign: 'middle' }} /></span>
                  </span>
                </span>
              </Link>
            </div>

            {/* Right Column: Handcrafted Feature Flag Control */}
            <div className="cta-visual-col">
              <div className="cta-flag-control">
                <div className="control-header">
                  <div className="header-meta">
                    <span className="control-flag-name"><code>NEW_CHECKOUT</code></span>
                    <span className="control-env-badge">Production</span>
                  </div>
                  {/* Small orange status indicator dot & label */}
                  <div className="control-status-indicator">
                    <span className="orange-pulse-dot"></span>
                    <span className="status-indicator-label">Active</span>
                  </div>
                </div>
                
                <div className="control-body">
                  <div className="control-row">
                    <span className="control-label">Evaluation State</span>
                    <div className="control-toggle-wrapper">
                      <span className="toggle-state-text state-off">OFF</span>
                      <span className="toggle-state-text state-on">ON</span>
                      <div className="mini-toggle-switch">
                        <div className="mini-toggle-thumb"></div>
                      </div>
                    </div>
                  </div>

                  <div className="control-row-slider">
                    <div className="slider-meta">
                      <span className="slider-label">Rollout Target</span>
                      <span className="slider-percent">{ctaRollout}%</span>
                    </div>
                    <div className="mini-slider-track">
                      <div className="mini-slider-fill" style={{ width: `${ctaRollout}%` }}></div>
                      <div className="mini-slider-thumb" style={{ left: `${ctaRollout}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
