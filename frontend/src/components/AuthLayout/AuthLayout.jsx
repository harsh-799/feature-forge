import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import AuthVisual from '../AuthVisual/AuthVisual'
import './AuthLayout.css'

export default function AuthLayout({ children }) {
  const layoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // GSAP context scopes selectors to layoutRef to prevent global queries
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo('.animate-logo', 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.5 }
      )
      .fromTo('.animate-editorial', 
        { opacity: 0, y: 8 }, 
        { opacity: 1, y: 0, duration: 0.4 },
        '-=0.25'
      )
      .fromTo('.animate-title', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.3'
      )
      .fromTo('.animate-desc', 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.4 },
        '-=0.3'
      );
    }, layoutRef);

    return () => ctx.revert();
  }, []);

  // Quick exit transition before routing to landing page
  const handleLogoClick = (e) => {
    e.preventDefault();

    const tl = gsap.timeline({
      onComplete: () => {
        navigate('/');
      }
    });

    // Content fades out and slides down 8px
    tl.to('.auth-right-panel, .auth-hero-content, .auth-brand-logo', {
      opacity: 0,
      y: 8,
      duration: 0.25,
      ease: 'power2.inOut'
    });

    // Whole layout container opacity fades out
    tl.to(layoutRef.current, {
      opacity: 0,
      duration: 0.15,
      ease: 'power2.inOut'
    }, '-=0.15');
  };

  return (
    <div className="auth-layout-container" ref={layoutRef}>
      {/* Left side: Product / Branding Area (55-58% width) */}
      <div className="auth-left-panel">
        
        {/* Top-left: Brand Logo and Title */}
        <Link to="/" className="auth-brand-logo animate-logo" onClick={handleLogoClick}>
          <div className="navbar-logo-circle auth-logo-circle">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5.5" fill="#F97316" stroke="#F97316" />
              <path d="M2.5 13.5c4-2 11-4 17.5-6.5M4.5 17c4.5-2 11.5-4.5 16-8.5" stroke="#121212" strokeWidth="2.2" />
            </svg>
          </div>
          <span className="auth-brand-name">FeatureForge</span>
        </Link>

        {/* Center: Hero copy block */}
        <div className="auth-hero-content">
          <div className="auth-editorial-label animate-editorial">
            <span className="auth-dash">—</span> CONTROL THE RELEASE
          </div>
          
          <h1 className="auth-title-heading animate-title">
            Ship code.<br />
            Release on your terms.
          </h1>
          
          <p className="auth-subtitle-desc animate-desc">
            Deploy independently and control when features reach your users.
          </p>

          <AuthVisual />
        </div>

        {/* Empty bottom element to anchor flex alignment */}
        <div className="auth-left-footer"></div>
      </div>

      {/* Right side: Forms Area (42-45% width) */}
      <div className="auth-right-panel">
        <div className="auth-form-wrapper">
          {children}
        </div>
      </div>
    </div>
  )
}
