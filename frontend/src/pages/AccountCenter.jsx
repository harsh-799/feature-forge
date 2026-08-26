import React, { useState, useEffect } from 'react';
import { FiMail, FiShield, FiEye, FiEyeOff, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { changePassword, getErrorMessage } from '../api/authApi';
import './AccountCenter.css';

export default function AccountCenter() {
  const [fullname, setFullname] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Change-password form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const cachedEmail = localStorage.getItem('userEmail');
    const cachedFullname = localStorage.getItem('userFullname');
    setUserEmail(cachedEmail || 'developer@featureforge.com');
    setFullname(cachedFullname || 'FeatureForge User');
  }, []);

  const displayName = fullname || (userEmail ? userEmail.split('@')[0] : 'Developer');
  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : 'F';

  // Derived validation flags (live feedback same pattern as Signup)
  const newPasswordLengthValid = newPassword.length >= 8 && newPassword.length <= 15;
  const passwordsMatch = newPassword.length > 0 && confirmPassword === newPassword;
  const passwordsMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  // Form is submittable only when all three fields filled + passwords match + length ok
  const isFormReady =
    currentPassword.length > 0 &&
    newPasswordLengthValid &&
    passwordsMatch;

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    setFormErrors({});
    setShowPasswordForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Front-end guards
    const errors = {};
    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword) errors.newPassword = 'New password is required';
    else if (!newPasswordLengthValid) errors.newPassword = 'Password must be between 8 and 15 characters';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your new password';
    else if (passwordsMismatch) errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully.');
      resetForm();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="account-center-page">
      <div className="account-center-header">
        <span className="account-badge">SETTINGS</span>
        <h1 className="account-title">Account Center</h1>
        <p className="account-desc">
          Manage your personal details and security credentials.
        </p>
      </div>

      <div className="account-center-content">
        {/* Account Details Card */}
        <div className="account-card">
          <div className="account-avatar-wrapper">
            <div className="account-avatar-circle">{avatarLetter}</div>
          </div>
          <div className="account-details-info">
            <div className="account-name-row">
              <h2 className="account-name">{displayName}</h2>
            </div>
            <div className="account-email-row">
              <FiMail className="account-email-icon" />
              <span className="account-email-text">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Security Settings Card */}
        <div className={`account-card security-card ${showPasswordForm ? 'security-card--expanded' : ''}`}>
          {!showPasswordForm ? (
            /* Collapsed: description + button */
            <>
              <div className="security-card-left">
                <div className="security-title-group">
                  <FiShield className="security-icon" />
                  <h3 className="security-heading">Security</h3>
                </div>
                <p className="security-desc">
                  Keep your account secure by updating your password regularly.
                </p>
              </div>
              <div className="security-card-right">
                <button
                  className="security-change-btn"
                  onClick={() => setShowPasswordForm(true)}
                >
                  Change Password
                </button>
              </div>
            </>
          ) : (
            /* Expanded: inline change-password form */
            <div className="cp-form-wrapper">
              <div className="security-title-group" style={{ marginBottom: '20px' }}>
                <FiShield className="security-icon" />
                <h3 className="security-heading">Change Password</h3>
              </div>

              <form onSubmit={handleSubmit} className="cp-form" noValidate>
                {/* Current Password */}
                <div className="cp-form-group">
                  <label className="cp-label" htmlFor="currentPassword">Current Password</label>
                  <div className="cp-input-wrapper">
                    <input
                      id="currentPassword"
                      type={showCurrentPw ? 'text' : 'password'}
                      className={`cp-input ${formErrors.currentPassword ? 'cp-input--error' : ''}`}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (formErrors.currentPassword) setFormErrors(p => ({ ...p, currentPassword: null }));
                      }}
                      placeholder="Enter current password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="cp-toggle-btn"
                      onClick={() => setShowCurrentPw(v => !v)}
                      disabled={isSubmitting}
                      aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                  {formErrors.currentPassword && (
                    <span className="cp-error-msg">
                      <FiAlertCircle size={12} /> {formErrors.currentPassword}
                    </span>
                  )}
                </div>

                {/* New Password */}
                <div className="cp-form-group">
                  <label className="cp-label" htmlFor="newPassword">New Password</label>
                  <div className="cp-input-wrapper">
                    <input
                      id="newPassword"
                      type={showNewPw ? 'text' : 'password'}
                      className={`cp-input ${formErrors.newPassword ? 'cp-input--error' : ''}`}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (formErrors.newPassword) setFormErrors(p => ({ ...p, newPassword: null }));
                      }}
                      placeholder="Choose a new password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="cp-toggle-btn"
                      onClick={() => setShowNewPw(v => !v)}
                      disabled={isSubmitting}
                      aria-label={showNewPw ? 'Hide password' : 'Show password'}
                    >
                      {showNewPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                  {/* Length hint — same pattern as Signup */}
                  <div className={`password-hint-row ${newPasswordLengthValid ? 'hint-valid' : ''}`}>
                    {newPasswordLengthValid
                      ? <FiCheck size={13} className="password-hint-icon-valid" />
                      : <FiAlertCircle size={13} className="password-hint-icon-invalid" />
                    }
                    <span>8–15 characters required</span>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="cp-form-group">
                  <label className="cp-label" htmlFor="confirmNewPassword">Confirm New Password</label>
                  <div className="cp-input-wrapper confirm-password-wrapper">
                    <input
                      id="confirmNewPassword"
                      type={showConfirmPw ? 'text' : 'password'}
                      className={`cp-input ${formErrors.confirmPassword ? 'cp-input--error' : ''}`}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (formErrors.confirmPassword) setFormErrors(p => ({ ...p, confirmPassword: null }));
                      }}
                      placeholder="Confirm new password"
                      disabled={isSubmitting}
                    />
                    {/* Tick / Cross live indicator — same pattern as Signup */}
                    {confirmPassword && (
                      <div className="password-match-indicator">
                        {passwordsMatch
                          ? <FiCheck size={17} className="password-match-icon-success" />
                          : <FiX size={17} className="password-match-icon-error" />
                        }
                      </div>
                    )}
                    <button
                      type="button"
                      className="cp-toggle-btn"
                      onClick={() => setShowConfirmPw(v => !v)}
                      disabled={isSubmitting}
                      aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <span className="cp-error-msg">
                      <FiAlertCircle size={12} /> {formErrors.confirmPassword}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="cp-actions">
                  <button
                    type="button"
                    className="cp-cancel-btn"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cp-submit-btn"
                    disabled={isSubmitting || !isFormReady}
                  >
                    {isSubmitting ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
