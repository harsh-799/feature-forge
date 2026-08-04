import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { register, getErrorMessage } from '../../api/authApi'
import AuthLayout from '../../components/AuthLayout/AuthLayout'
import '../Login/Login.css' // Import shared login styling for consistency
import './Signup.css'

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [errors, setErrors] = useState({});

  // Client-side field validations mapping the backend constraints
  const validateForm = () => {
    const newErrors = {};
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      newErrors.fullName = 'Name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8 || password.length > 15) {
      newErrors.password = 'Password must be between 8 and 15 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return; // Prevent duplicate submissions

    if (!validateForm()) {
      toast.error('Please correct the validation errors in the form.', {
        icon: <FiAlertCircle size={18} style={{ color: 'var(--accent)' }} />
      });
      return;
    }

    setIsLoading(true);

    try {
      // Send exactly the backend DTO fields (no confirmPassword)
      await register({
        fullName: fullName.trim(),
        email,
        password
      });

      toast.success('Account created successfully.', {
        icon: (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 11 12 14 17 8" />
          </svg>
        )
      });

      // Smoothly exit and navigate to login
      setIsExiting(true);
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg, {
        icon: <FiAlertCircle size={18} style={{ color: 'var(--accent)' }} />
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Subtle form transition when switching to Login
  const handleSignInClick = (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsExiting(true);
    setTimeout(() => {
      navigate('/login');
    }, 250);
  };

  return (
    <AuthLayout>
      <div className={`auth-form-container ${isExiting ? 'exit-to-signup' : 'enter-form'}`}>
        <h2 className="auth-form-title">Create your account</h2>
        <p className="auth-form-subtitle">Start shipping features with confidence.</p>

        <form onSubmit={handleSignupSubmit} className="auth-form" noValidate>
          {/* Full Name field */}
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              className={`form-input ${errors.fullName ? 'has-error' : ''}`}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors(prev => ({ ...prev, fullName: null }));
              }}
              placeholder="John Doe"
              disabled={isLoading}
              required
            />
            {errors.fullName && (
              <span className="form-error-msg">
                <FiAlertCircle size={12} className="error-icon" /> {errors.fullName}
              </span>
            )}
          </div>

          {/* Email field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'has-error' : ''}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: null }));
              }}
              placeholder="you@domain.com"
              disabled={isLoading}
              required
            />
            {errors.email && (
              <span className="form-error-msg">
                <FiAlertCircle size={12} className="error-icon" /> {errors.email}
              </span>
            )}
          </div>

          {/* Password field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'has-error' : ''}`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                }}
                placeholder="Choose a password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error-msg">
                <FiAlertCircle size={12} className="error-icon" /> {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-input ${errors.confirmPassword ? 'has-error' : ''}`}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
                }}
                placeholder="Confirm password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="form-error-msg">
                <FiAlertCircle size={12} className="error-icon" /> {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Submit action button */}
          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? (
              'Creating account...'
            ) : (
              <>
                Create Account <span className="btn-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <p className="auth-redirect-text">
          Already have an account?{' '}
          <a href="/login" className="auth-redirect-link" onClick={handleSignInClick}>
            Sign in
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}
