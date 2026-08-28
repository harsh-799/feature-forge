import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiEye, FiEyeOff, FiAlertCircle, FiArrowLeft, FiCheck, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { resetPassword as apiResetPassword, getErrorMessage } from '../api/authApi'
import AuthLayout from '../components/auth/AuthLayout'
import './Login.css'

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing password reset token.');
      navigate('/login');
    }
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors = {};
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
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiResetPassword(token, { email, password });
      toast.success(response.message || 'Password reset successfully. Please sign in with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to reset password.'));
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = 
    email.trim().length > 0 && 
    /\S+@\S+\.\S+/.test(email) && 
    password.length >= 8 && 
    password.length <= 15 && 
    confirmPassword === password;

  return (
    <AuthLayout>
      <div className="auth-form-container enter-form">
        <h2 className="auth-form-title">Reset password</h2>
        <p className="auth-form-subtitle">Choose a new password for your FeatureForge account.</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
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
            <label className="form-label" htmlFor="password">New Password</label>
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
                placeholder="Min 8 characters"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
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
            <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
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
            {isLoading ? 'Resetting password...' : (
              <>
                Reset Password <span className="btn-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <p className="auth-redirect-text" style={{ marginTop: '24px' }}>
          <a 
            href="/login" 
            className="auth-redirect-link" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            <FiArrowLeft size={14} /> Back to Login
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}
