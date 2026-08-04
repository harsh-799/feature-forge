import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

  const handleNavClick = (e, targetId) => {
    if (window.location.pathname !== '/') {
      e.preventDefault();
      window.location.href = `/#${targetId}`;
    } else {
      handleNavLinkClick(e, targetId);
    }
  };

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="navbar-logo-circle" onClick={(e) => {
        if (window.location.pathname === '/') {
          handleNavLinkClick(e, 'top');
        }
      }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="brand-logo-svg">
          <circle cx="12" cy="12" r="5.5" fill="#F97316" stroke="#F97316" />
          <path d="M2.5 13.5c4-2 11-4 17.5-6.5M4.5 17c4.5-2 11.5-4.5 16-8.5" stroke="#121212" strokeWidth="2.2" />
        </svg>
      </Link>
      
      <nav className="header-nav">
        <a href="#features" className="navbar-link roll-up" onClick={(e) => handleNavClick(e, 'features')}>
          <span className="link-text-container">
            <span className="link-text-primary">Features</span>
            <span className="link-text-secondary">Features</span>
          </span>
        </a>
        <a href="#how-it-works" className="navbar-link roll-down" onClick={(e) => handleNavClick(e, 'how-it-works')}>
          <span className="link-text-container">
            <span className="link-text-primary">How it Works</span>
            <span className="link-text-secondary">How it Works</span>
          </span>
        </a>
        <a href="#docs" className="navbar-link roll-up" onClick={(e) => handleNavClick(e, 'docs')}>
          <span className="link-text-container">
            <span className="link-text-primary">Documentation</span>
            <span className="link-text-secondary">Documentation</span>
          </span>
        </a>
      </nav>

      <div className="header-right">
        <Link to="/login" className="navbar-link roll-down login-link">
          <span className="link-text-container">
            <span className="link-text-primary">Login</span>
            <span className="link-text-secondary">Login</span>
          </span>
        </Link>
        <Link to="/signup" className="btn-get-started-pill">
          <span className="btn-text-crop roll-up">
            <span className="link-text-container">
              <span className="link-text-primary">Get Started</span>
              <span className="link-text-secondary">Get Started</span>
            </span>
          </span>
        </Link>
      </div>
    </header>
  )
}
