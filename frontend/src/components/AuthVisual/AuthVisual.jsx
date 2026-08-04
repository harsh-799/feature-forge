import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import './AuthVisual.css'

export default function AuthVisual() {
  const primaryCardRef = useRef(null);
  const secondaryCardRef = useRef(null);
  const tertiaryCardRef = useRef(null);
  const rolloutRef = useRef(null);

  const [evalCount, setEvalCount] = useState(24500);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  // GSAP entrance staggers
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setEvalCount(24581);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // 1. Primary Rollout Card enters (delay aligned with title fade)
      tl.fromTo(primaryCardRef.current,
        { opacity: 0, y: 24, rotation: 0 },
        { opacity: 1, y: 0, rotation: -2.5, duration: 0.6, delay: 0.45 }
      )
      // 2. Live Evaluations card enters with ~100ms stagger offset
      .fromTo(secondaryCardRef.current,
        { opacity: 0, y: 20, rotation: 0 },
        { opacity: 1, y: 0, rotation: 2, duration: 0.5 },
        '-=0.5'
      )
      // 3. Production Status card enters
      .fromTo(tertiaryCardRef.current,
        { opacity: 0, y: 16, rotation: 0 },
        { opacity: 1, y: 0, rotation: -1, duration: 0.5 },
        '-=0.4'
      );

      // 4. Rollout indicator animates 10% -> 25%
      if (rolloutRef.current) {
        gsap.fromTo(rolloutRef.current,
          { width: '10%' },
          { width: '25%', duration: 0.8, ease: 'power2.out', delay: 0.95 }
        );
      }

      // 5. Evaluation count increases to 24,581
      const countObj = { val: 24500 };
      gsap.to(countObj, {
        val: 24581,
        duration: 1.0,
        ease: 'power2.out',
        delay: 0.95,
        onUpdate: () => {
          setEvalCount(Math.floor(countObj.val));
        }
      });
    });

    return () => ctx.revert();
  }, []);

  // Subtle pointer depth parallax (desktop only)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleMouseMove = (e) => {
      if (window.innerWidth <= 960) return;
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      // Max movement of ~5px
      setParallaxOffset({ x: x * 5, y: y * 5 });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="auth-visual-composition">
      
      {/* Visual 1 — PRIMARY ROLLOUT CARD (Rotation -2.5deg) */}
      <div 
        className="visual-card visual-card-primary"
        ref={primaryCardRef}
        style={{
          transform: `rotate(-2.5deg) translate(${parallaxOffset.x * 0.5}px, ${parallaxOffset.y * 0.5}px)`
        }}
      >
        <div className="card-header-simple">
          <span className="primary-flag-key"><code>NEW_CHECKOUT</code></span>
          <span className="primary-badge-active">ACTIVE</span>
        </div>
        
        <div className="primary-card-body">
          <div className="primary-meta-row">
            <span className="primary-meta-env">STAGING</span>
            <div className="primary-meta-percent">
              <span className="meta-percent-label">Rollout Target</span>
              <span className="meta-percent-val">25%</span>
            </div>
          </div>

          {/* Rollout slider line */}
          <div className="primary-slider-track">
            <div className="primary-slider-fill" ref={rolloutRef}></div>
            <div className="primary-slider-thumb"></div>
          </div>

          <div className="primary-slider-ticks">
            <span>10%</span>
            <span className="active">25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Visual 2 — LIVE EVALUATION CARD (Rotation +2deg) */}
      <div 
        className="visual-card visual-card-secondary"
        ref={secondaryCardRef}
        style={{
          transform: `rotate(2deg) translate(${parallaxOffset.x * 1.1}px, ${parallaxOffset.y * 1.1}px)`
        }}
      >
        <div className="secondary-card-title">LIVE EVALUATIONS</div>
        <div className="secondary-card-value">{evalCount.toLocaleString()}</div>
        <div className="secondary-card-footer">
          <span className="secondary-footer-label">Evaluations</span>
          <span className="secondary-footer-metric">1.2ms avg</span>
        </div>
        
        {/* Minimal activity sparkline graph */}
        <div className="secondary-sparkline">
          <svg viewBox="0 0 120 20" width="100%" height="20">
            <path 
              d="M0 16 Q 15 14 30 18 T 60 8 T 90 12 T 120 6" 
              fill="none" 
              stroke="var(--accent)" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
            />
          </svg>
        </div>
      </div>

      {/* Visual 3 — PRODUCTION STATUS (Rotation -1deg) */}
      <div 
        className="visual-card visual-card-tertiary"
        ref={tertiaryCardRef}
        style={{
          transform: `rotate(-1deg) translate(${parallaxOffset.x * 0.8}px, ${parallaxOffset.y * 0.8}px)`
        }}
      >
        <span className="tertiary-card-title">PRODUCTION</span>
        <div className="tertiary-status-row">
          <span className="status-indicator-dot"></span>
          <span className="status-indicator-label">NOT RELEASED</span>
        </div>
        <div className="tertiary-footer-msg">Ready for controlled release</div>
      </div>

    </div>
  )
}
