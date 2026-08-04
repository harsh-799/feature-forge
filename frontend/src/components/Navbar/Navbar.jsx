import { useState, useEffect } from 'react'
import { handleNavLinkClick } from '../../utils/scroll'
import './Navbar.css'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-logo-circle">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="brand-logo-svg">
          <circle cx="12" cy="12" r="5.5" fill="#F97316" stroke="#F97316" />
          <path d="M2.5 13.5c4-2 11-4 17.5-6.5M4.5 17c4.5-2 11.5-4.5 16-8.5" stroke="#121212" strokeWidth="2.2" />
        </svg>
      </div>
      
      <nav className="header-nav">
        <a href="#features" className="navbar-link roll-up" onClick={(e) => handleNavLinkClick(e, 'features')}>
          <span className="link-text-container">
            <span className="link-text-primary">Features</span>
            <span className="link-text-secondary">Features</span>
          </span>
        </a>
        <a href="#how-it-works" className="navbar-link roll-down" onClick={(e) => handleNavLinkClick(e, 'how-it-works')}>
          <span className="link-text-container">
            <span className="link-text-primary">How it Works</span>
            <span className="link-text-secondary">How it Works</span>
          </span>
        </a>
        <a href="#docs" className="navbar-link roll-up" onClick={(e) => handleNavLinkClick(e, 'docs')}>
          <span className="link-text-container">
            <span className="link-text-primary">Documentation</span>
            <span className="link-text-secondary">Documentation</span>
          </span>
        </a>
      </nav>

      <div className="header-right">
        <a href="#login" className="navbar-link roll-down login-link">
          <span className="link-text-container">
            <span className="link-text-primary">Login</span>
            <span className="link-text-secondary">Login</span>
          </span>
        </a>
        <a href="#get-started-section" className="btn-get-started-pill" onClick={(e) => handleNavLinkClick(e, 'get-started-section')}>
          <span className="btn-text-crop roll-up">
            <span className="link-text-container">
              <span className="link-text-primary">Get Started</span>
              <span className="link-text-secondary">Get Started</span>
            </span>
          </span>
        </a>
      </div>
    </header>
  )
}
