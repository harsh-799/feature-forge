import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { login as apiLogin, forgotPassword, getErrorMessage } from '../api/authApi'
import { listWorkspaces } from '../api/workspaceApi'
import { useAuth } from '../components/auth/AuthContext'

import { getRedirectUrl } from '../utils/navigation'
import AuthLayout from '../components/auth/AuthLayout'
import './Login.css'

export default function Login() {
  const navigate = useNavigate();
  const { login, authState } = useAuth();

  useEffect(() => {
    if (authState === 'authenticated') {
      const redirectUrl = getRedirectUrl();
      navigate(redirectUrl || '/app/overview', { replace: true });
    }
  }, [authState, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [errors, setErrors] = useState({});

  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotErrors, setForgotErrors] = useState({});

  // Client-side field validations
  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return; // Prevent duplicate submissions

    if (!validateForm()) {
      toast.error('Please correct the validation errors in the form.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiLogin({ email, password });

      // Persist authenticating JWT token if returned
      if (response.token) {
        login(response.token, response.email || email, response.fullName || response.fullname || '');
      }

      toast.success(response.message || 'Successfully signed in.');

      // Redirect check
      const redirectUrl = getRedirectUrl();
      if (redirectUrl) {
        navigate(redirectUrl);
        return;
      }

      // Redirect check based on workspaces existence
      const workspaces = await listWorkspaces();
      if (workspaces && workspaces.length > 0) {
        localStorage.setItem('currentWorkspaceId', workspaces[0].workspaceId);
        localStorage.setItem('currentWorkspaceName', workspaces[0].workspaceName);
        localStorage.setItem('currentWorkspaceRole', workspaces[0].role || 'DEVELOPER');
        localStorage.setItem('currentUserWorkspaceRole', workspaces[0].role);
        navigate('/app/overview');
      } else {
        navigate('/app/onboarding');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (isForgotLoading) return;

    if (!forgotEmail) {
      setForgotErrors({ email: 'Email is required' });
      return;
    } else if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsForgotLoading(true);
    try {
      const response = await forgotPassword(forgotEmail);
      toast.success(response.message || 'Password reset link sent successfully. Please check your inbox.');
      setIsForgotPassword(false);
      setForgotEmail('');
      setForgotErrors({});
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to send password reset link.'));
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Subtle form transition when switching to Signup
  const handleCreateAccountClick = (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsExiting(true);
    const redirectUrl = getRedirectUrl();
    setTimeout(() => {
      if (redirectUrl) {
        navigate(`/signup?redirect=${encodeURIComponent(redirectUrl)}`);
      } else {
        navigate('/signup');
      }
    }, 250);
  };

  const isFormValid = email.trim().length > 0 && /\S+@\S+\.\S+/.test(email) && password.length > 0;

  return (
    <AuthLayout>
      <div className={`auth-form-container ${isExiting ? 'exit-to-signup' : 'enter-form'}`}>
        {isForgotPassword ? (
          <>
            <h2 className="auth-form-title">Forgot password</h2>
            <p className="auth-form-subtitle">Enter your email address to receive a password reset link.</p>

            <form onSubmit={handleForgotSubmit} className="auth-form" noValidate>
              {/* Email field */}
              <div className="form-group">
                <label className="form-label" htmlFor="forgotEmail">Email</label>
                <input
                  id="forgotEmail"
                  type="email"
                  className={`form-input ${forgotErrors.email ? 'has-error' : ''}`}
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    if (forgotErrors.email) setForgotErrors(prev => ({ ...prev, email: null }));
                  }}
                  placeholder="you@domain.com"
                  disabled={isForgotLoading}
                  required
                />
                {forgotErrors.email && (
                  <span className="form-error-msg">
                    <FiAlertCircle size={12} className="error-icon" /> {forgotErrors.email}
                  </span>
                )}
              </div>

              {/* Submit action button */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isForgotLoading || !forgotEmail.trim().length || !/\S+@\S+\.\S+/.test(forgotEmail)}
              >
                {isForgotLoading ? 'Sending reset link...' : (
                  <>
                    Send Reset Link <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <p className="auth-redirect-text" style={{ marginTop: '24px' }}>
              <a
                href="#login"
                className="auth-redirect-link"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsForgotPassword(false);
                  setForgotErrors({});
                }}
              >
                <FiArrowLeft size={14} /> Back to Login
              </a>
            </p>
          </>
        ) : (
          <>
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-subtitle">Sign in to your FeatureForge account.</p>

            <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="password">Password</label>
                  <a
                    href="#forgot-password"
                    className="auth-redirect-link"
                    style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px' }}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsForgotPassword(true);
                      setErrors({});
                    }}
                  >
                    Forgot Password?
                  </a>
                </div>
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
                    placeholder="Enter password"
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

              {/* Submit action button */}
              <button type="submit" className="auth-submit-btn" disabled={isLoading || !isFormValid}>
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    Sign In <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <p className="auth-redirect-text">
              Don't have an account?{' '}
              <a
                href={getRedirectUrl() ? `/signup?redirect=${encodeURIComponent(getRedirectUrl())}` : '/signup'}
                className="auth-redirect-link"
                onClick={handleCreateAccountClick}
              >
                Create account
              </a>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
