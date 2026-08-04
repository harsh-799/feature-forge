import { FiExternalLink } from 'react-icons/fi'
import { handleNavLinkClick } from '../../utils/scroll'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer reveal-on-scroll">
      <div className="footer-container">
        <div className="footer-top">
          
          {/* Left Column: Brand, Tagline and Developer Badge */}
          <div className="footer-brand-col">
            <div className="footer-logo">
              <div className="navbar-logo-circle footer-logo-circle">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5.5" fill="#F97316" stroke="#F97316" />
                  <path d="M2.5 13.5c4-2 11-4 17.5-6.5M4.5 17c4.5-2 11.5-4.5 16-8.5" stroke="#121212" strokeWidth="2.2" />
                </svg>
              </div>
              <span className="footer-brand-name">FeatureForge</span>
            </div>
            <p className="footer-tagline">Ship features without shipping risk.</p>
            
            <div className="footer-status-badge">
              <span className="status-dot-orange"></span>
              <span className="status-badge-text">Built for developers</span>
            </div>
          </div>

          {/* Center Column: Product links */}
          <div className="footer-links-col">
            <h4 className="footer-links-title">Product</h4>
            <a href="#features" className="footer-link" onClick={(e) => handleNavLinkClick(e, 'features')}>Features</a>
            <a href="#how-it-works" className="footer-link" onClick={(e) => handleNavLinkClick(e, 'how-it-works')}>How it Works</a>
            <a href="#get-started-section" className="footer-link" onClick={(e) => handleNavLinkClick(e, 'get-started-section')}>Get Started</a>
          </div>

          {/* Right Column: Developer links */}
          <div className="footer-links-col">
            <h4 className="footer-links-title">Developers</h4>
            <a href="#docs" className="footer-link" onClick={(e) => handleNavLinkClick(e, 'docs')}>Documentation</a>
            <a href="https://github.com/harsh-799/feature-forge" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub <FiExternalLink size={11} style={{ marginLeft: '2px', verticalAlign: 'middle', opacity: 0.7 }} /></a>
            <a href="#login" className="footer-link">Login</a>
          </div>
          
        </div>

        <hr className="footer-divider" />

        {/* Large typography background signature */}
        <div className="footer-big-wordmark">FeatureForge</div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2026 FeatureForge</p>
          <a href="#top" className="footer-back-to-top" onClick={(e) => handleNavLinkClick(e, 'top')}>Back to top ↑</a>
        </div>
      </div>
    </footer>
  )
}
