import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiArrowRight, 
  FiExternalLink, 
  FiZap, 
  FiActivity, 
  FiLayers 
} from 'react-icons/fi'
import { handleNavLinkClick } from './scroll'
import './Hero.css'

export default function Hero() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);

  // Live request telemetry
  const [requestsCount, setRequestsCount] = useState(104820);

  // Parallax mouse move listener
  const handleMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    
    // Scale coordinate offsets relative to center (-1 to 1)
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  // Run dynamic evaluations counter loop
  useEffect(() => {
    const timer = setInterval(() => {
      // Accelerate count increment rate during hover states
      setRequestsCount(prev => prev + (isHovered ? Math.floor(Math.random() * 85) + 35 : Math.floor(Math.random() * 4) + 1));
    }, 150);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <section className="hero-section">
      <div className="hero-grid">
        {/* Hero Left: Text Editorial Block */}
        <div className="hero-content">
          <div className="hero-badge-editorial">
            <span className="editorial-dash">—</span>
            <span className="editorial-orange">FEATURE DELIVERY</span>
            <span className="editorial-sep">/</span>
            <span className="editorial-muted">CONTROLLED ROLLOUTS</span>
          </div>
          
          <h1 className="hero-title">
            Ship Features <br />
            with Confidence.
          </h1>
          
          <p className="hero-subtitle">
            Release, rollout, schedule, and evaluate features safely with a production-ready feature flag management platform.
          </p>
          
          <div className="hero-button-group">
            <button className="btn-primary-accent" onClick={() => navigate('/signup')}>
              <span className="btn-text-crop roll-up">
                <span className="link-text-container">
                  <span className="link-text-primary">
                    Get Started <FiArrowRight size={15} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                  </span>
                  <span className="link-text-secondary">
                    Get Started <FiArrowRight size={15} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                  </span>
                </span>
              </span>
            </button>
            <button className="btn-secondary-outline" onClick={(e) => handleNavLinkClick(e, 'docs')}>
              <span className="btn-text-crop roll-up">
                <span className="link-text-container">
                  <span className="link-text-primary">
                    Documentation <FiExternalLink size={13} className="icon-fade" style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                  </span>
                  <span className="link-text-secondary">
                    Documentation <FiExternalLink size={13} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                  </span>
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Hero Right: 3D Stacked Rollout Visual Showcase */}
        <div className="hero-visual-showcase">
          <div 
            className="rollout-stage-container"
            ref={stageRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Parallax Tilted Interactive Stage */}
            <div 
              className={`rollout-stage ${isHovered ? 'hovered' : ''}`}
              style={{
                transform: `perspective(1400px) rotateX(${18 + mousePos.y * 7}deg) rotateY(${-12 + mousePos.x * 7}deg) rotateZ(3deg)`
              }}
            >
              
              {/* 3D Card 1: Feature Flag Configuration (Top Layer) */}
              <div className="rollout-card card-flag">
                <div className="card-inner-float">
                  <div className="card-header">
                    <div className="header-left-meta">
                      <FiZap size={14} className="icon-orange" />
                      <span className="flag-title-meta">Flag: <code>NEW_CHECKOUT</code></span>
                    </div>
                    <div className="badge-row">
                      <span className="badge active">Active</span>
                      <span className="badge staged">Staged</span>
                    </div>
                  </div>

                  <div className="card-body">
                    {/* Toggle row */}
                    <div className="control-row">
                      <span className="control-label">Evaluation State</span>
                      <div className={`switch-pill ${isHovered ? 'checked' : ''}`}>
                        <div className="switch-thumb"></div>
                      </div>
                    </div>

                    {/* Custom Rollout slider */}
                    <div className="custom-slider-container">
                      <div className="slider-label-row">
                        <span className="slider-title">Rollout Target</span>
                        <span className="slider-percentage">{isHovered ? '100%' : '25%'}</span>
                      </div>
                      <div className="slider-track-wrap">
                        <div className="slider-track">
                          <div className="slider-fill" style={{ width: `${isHovered ? 100 : 25}%` }}></div>
                          <div className="slider-thumb" style={{ left: `${isHovered ? 100 : 25}%` }}></div>
                        </div>
                      </div>
                      <div className="slider-ticks">
                        <span className={`tick-label ${!isHovered ? 'active' : ''}`}>10%</span>
                        <span className={`tick-label ${!isHovered ? 'active' : ''}`}>25%</span>
                        <span className="tick-label">50%</span>
                        <span className="tick-label">75%</span>
                        <span className={`tick-label ${isHovered ? 'active' : ''}`}>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Card 2: Analytics Telemetry (Middle Layer) */}
              <div className="rollout-card card-analytics">
                <div className="card-inner-float" style={{ animationDelay: '-1.6s' }}>
                  <div className="card-header">
                    <FiActivity size={14} className="icon-orange" />
                    <span className="card-title-meta">Real-time Telemetry</span>
                  </div>
                  <div className="card-body">
                    <div className="telemetry-stat">
                      <span className="telemetry-label">Processed Requests</span>
                      <span className="telemetry-counter">{requestsCount.toLocaleString()}</span>
                    </div>
                    {/* Dynamic Bar Charts */}
                    <div className="telemetry-chart">
                      <div className="chart-bar" style={{ height: isHovered ? '85%' : '35%' }}></div>
                      <div className="chart-bar" style={{ height: isHovered ? '70%' : '20%' }}></div>
                      <div className="chart-bar" style={{ height: isHovered ? '95%' : '40%' }}></div>
                      <div className="chart-bar" style={{ height: isHovered ? '80%' : '25%' }}></div>
                      <div className="chart-bar" style={{ height: isHovered ? '100%' : '30%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Card 3: Status Details (Bottom Layer) */}
              <div className="rollout-card card-status">
                <div className="card-inner-float" style={{ animationDelay: '-3.2s' }}>
                  <div className="card-header">
                    <FiLayers size={14} className="icon-orange" />
                    <span className="card-title-meta">Staging Auto Scale</span>
                  </div>
                  <div className="card-body">
                    <div className="status-item">
                      <span className="status-label">Health Check</span>
                      <div className="health-badge">
                        <span className="blinking-dot"></span>
                        <span className="health-text">Optimal</span>
                      </div>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Active Scale</span>
                      <span className="status-value">{isHovered ? '100% Traffic' : '25% Traffic'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Far Right: Circular Rollout Progress Gauge */}
              <div className="rollout-circular-gauge">
                <div className="gauge-inner-float" style={{ animationDelay: '-0.8s' }}>
                  <svg className="circular-svg" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" className="gauge-bg-track" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      className="gauge-fill-path" 
                      style={{ 
                        strokeDasharray: `${2 * Math.PI * 42}`, 
                        strokeDashoffset: `${2 * Math.PI * 42 * (1 - (isHovered ? 100 : 25) / 100)}` 
                      }}
                    />
                  </svg>
                  <div className="gauge-knob">
                    <span className="gauge-value-text">{isHovered ? '100%' : '25%'}</span>
                    <span className="gauge-label-text">Rollout</span>
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
