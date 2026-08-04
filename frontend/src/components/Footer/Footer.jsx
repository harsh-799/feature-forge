import { Link } from 'react-router-dom'
import { FiExternalLink } from 'react-icons/fi'
import { handleNavLinkClick } from '../../utils/scroll'
import { BrandMark } from '../Brand/Brand'
import './Footer.css'

export default function Footer() {
  const handleNavClick = (e, targetId) => {
    if (window.location.pathname !== '/') {
      e.preventDefault();
      window.location.href = `/#${targetId}`;
    } else {
      handleNavLinkClick(e, targetId);
    }
  };

  return (
    <footer className="site-footer reveal-on-scroll">
      <div className="footer-container">
        <div className="footer-top">
          
          {/* Left Column: Brand, Tagline and Developer Badge */}
          <div className="footer-brand-col">
            <div className="footer-logo">
              <BrandMark className="footer-logo-circle" />
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
            <a href="#features" className="footer-link" onClick={(e) => handleNavClick(e, 'features')}>Features</a>
            <a href="#how-it-works" className="footer-link" onClick={(e) => handleNavClick(e, 'how-it-works')}>How it Works</a>
            <Link to="/signup" className="footer-link">Get Started</Link>
          </div>

          {/* Right Column: Developer links */}
          <div className="footer-links-col">
            <h4 className="footer-links-title">Developers</h4>
            <a href="#docs" className="footer-link" onClick={(e) => handleNavClick(e, 'docs')}>Documentation</a>
            <a href="https://github.com/harsh-799/feature-forge" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub <FiExternalLink size={11} style={{ marginLeft: '2px', verticalAlign: 'middle', opacity: 0.7 }} /></a>
            <a href="#login" className="footer-link">Login</a>
          </div>
          
        </div>

        <hr className="footer-divider" />

        {/* Large typography background signature */}
        <div className="footer-big-wordmark">FeatureForge</div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2026 FeatureForge</p>
          <a href="#top" className="footer-back-to-top" onClick={(e) => handleNavClick(e, 'top')}>Back to top ↑</a>
        </div>
      </div>
    </footer>
  )
}
