import React, { useState, useEffect } from 'react';
import { FiMail, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './AccountCenter.css';

export default function AccountCenter() {
  const [fullname, setFullname] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const cachedEmail = localStorage.getItem('userEmail');
    const cachedFullname = localStorage.getItem('userFullname');
    setUserEmail(cachedEmail || 'developer@featureforge.com');
    setFullname(cachedFullname || 'FeatureForge User');
  }, []);

  const displayName = fullname || (userEmail ? userEmail.split('@')[0] : 'Developer');
  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : 'F';

  const handlePasswordChangeClick = () => {
    toast.info('Password changes are not supported by the backend yet.');
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
        <div className="account-card security-card">
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
              onClick={handlePasswordChangeClick}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
