import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { handleNavLinkClick } from './scroll'
import { BrandMark } from './Brand'
import { FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../auth/AuthContext'
import './Navbar.css'


export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { authState } = useAuth();
  const isAuthenticated = authState === 'authenticated';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleNavClick = (e, targetId) => {
    setIsMenuOpen(false);
    if (window.location.pathname !== '/') {
      e.preventDefault();
      window.location.href = `/#${targetId}`;
    } else {
      handleNavLinkClick(e, targetId);
    }
  };

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''} ${isMenuOpen ? 'mobile-open' : ''}`}>
      <div className="header-top-row">
        <Link to="/" onClick={(e) => {
          if (window.location.pathname === '/') {
            handleNavLinkClick(e, 'top');
          }
          setIsMenuOpen(false);
        }}>
          <BrandMark />
        </Link>

        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>
      
      <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
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
        <Link to="/documentation" className="navbar-link roll-up" onClick={() => setIsMenuOpen(false)}>
          <span className="link-text-container">
            <span className="link-text-primary">Documentation</span>
            <span className="link-text-secondary">Documentation</span>
          </span>
        </Link>
      </nav>

      <div className={`header-right ${isMenuOpen ? 'open' : ''} ${isAuthenticated ? 'logged-in' : ''}`}>
        {authState === 'initializing' ? (
          <div style={{ width: '100px', height: '40px' }} />
        ) : isAuthenticated ? (
          <Link to="/app/overview" className="btn-get-started-pill" onClick={() => setIsMenuOpen(false)}>
            <span className="btn-text-crop roll-up">
              <span className="link-text-container">
                <span className="link-text-primary">Open App</span>
                <span className="link-text-secondary">Open App</span>
              </span>
            </span>
          </Link>
        ) : (
          <>
            <Link to="/login" className="navbar-link roll-down login-link" onClick={() => setIsMenuOpen(false)}>
              <span className="link-text-container">
                <span className="link-text-primary">Login</span>
                <span className="link-text-secondary">Login</span>
              </span>
            </Link>
            <Link to="/signup" className="btn-get-started-pill" onClick={() => setIsMenuOpen(false)}>
              <span className="btn-text-crop roll-up">
                <span className="link-text-container">
                  <span className="link-text-primary">Get Started</span>
                  <span className="link-text-secondary">Get Started</span>
                </span>
              </span>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
