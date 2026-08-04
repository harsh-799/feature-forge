import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { login, getErrorMessage } from '../../api/authApi'
import { listWorkspaces } from '../../api/workspaceApi'
import AuthLayout from '../../components/AuthLayout/AuthLayout'
import './Login.css'

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [errors, setErrors] = useState({});

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
      toast.error('Please correct the validation errors in the form.', {
        icon: <FiAlertCircle size={18} style={{ color: 'var(--accent)' }} />
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ email, password });

      // Persist authenticating JWT token if returned
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userEmail', email);
      }

      toast.success(response.message || 'Successfully signed in.', {
        icon: (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 11 12 14 17 8" />
          </svg>
        )
      });

      // Redirect check based on workspaces existence
      const workspaces = await listWorkspaces();
      if (workspaces && workspaces.length > 0) {
        localStorage.setItem('currentWorkspaceId', workspaces[0].workspaceId);
        localStorage.setItem('currentWorkspaceName', workspaces[0].workspaceName);
        navigate('/app/features');
      } else {
        navigate('/app/onboarding');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg, {
        icon: <FiAlertCircle size={18} style={{ color: 'var(--accent)' }} />
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Subtle form transition when switching to Signup
  const handleCreateAccountClick = (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsExiting(true);
    setTimeout(() => {
      navigate('/signup');
    }, 250);
  };

  return (
    <AuthLayout>
      <div className={`auth-form-container ${isExiting ? 'exit-to-signup' : 'enter-form'}`}>
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
          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
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
          <a href="/signup" className="auth-redirect-link" onClick={handleCreateAccountClick}>
            Create account
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}
