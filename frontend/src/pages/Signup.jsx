import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiAlertCircle, FiCheck, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { register, getErrorMessage } from '../api/authApi'
import { getRedirectUrl } from '../utils/navigation'
import AuthLayout from '../components/auth/AuthLayout'
import './Login.css' // Import shared login styling for consistency

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
      toast.error('Please correct the validation errors in the form.');
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

      toast.success('Account created successfully.');

      // Smoothly exit and navigate to login
      setIsExiting(true);
      const redirectUrl = getRedirectUrl();
      setTimeout(() => {
        if (redirectUrl) {
          navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        } else {
          navigate('/login');
        }
      }, 1000);
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Subtle form transition when switching to Login
  const handleSignInClick = (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsExiting(true);
    const redirectUrl = getRedirectUrl();
    setTimeout(() => {
      if (redirectUrl) {
        navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      } else {
        navigate('/login');
      }
    }, 250);
  };

  const isFormValid = 
    fullName.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    password.length >= 8 &&
    password.length <= 15 &&
    confirmPassword === password;

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
            <div className={`password-hint-row ${(password.length >= 8 && password.length <= 15) ? 'hint-valid' : ''}`}>
              {(password.length >= 8 && password.length <= 15) ? (
                <FiCheck size={14} className="password-hint-icon-valid" />
              ) : (
                <FiAlertCircle size={14} className="password-hint-icon-invalid" />
              )}
              <span>8-15 characters required</span>
            </div>
            {errors.password && errors.password !== 'Password must be between 8 and 15 characters' && (
              <span className="form-error-msg">
                <FiAlertCircle size={12} className="error-icon" /> {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper confirm-password-wrapper">
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
              {confirmPassword && (
                <div className="password-match-indicator">
                  {confirmPassword === password ? (
                    <FiCheck size={18} className="password-match-icon-success" />
                  ) : (
                    <FiX size={18} className="password-match-icon-error" />
                  )}
                </div>
              )}
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
          <button type="submit" className="auth-submit-btn" disabled={isLoading || !isFormValid}>
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
          <a 
            href={getRedirectUrl() ? `/login?redirect=${encodeURIComponent(getRedirectUrl())}` : '/login'} 
            className="auth-redirect-link" 
            onClick={handleSignInClick}
          >
            Sign in
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}
