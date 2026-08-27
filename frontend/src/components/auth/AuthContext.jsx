import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeTo401 } from '../../api/apiClient';
import { listWorkspaces } from '../../api/workspaceApi';

const AuthContext = createContext(null);

let redirectingToLogin = false;

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState('initializing');
  const navigate = useNavigate();

  const logout = () => {
    redirectingToLogin = false;
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullname');
    localStorage.removeItem('currentWorkspaceId');
    localStorage.removeItem('currentWorkspaceName');
    localStorage.removeItem('currentWorkspaceRole');
    localStorage.removeItem('currentUserWorkspaceRole');
    setAuthState('unauthenticated');
    navigate('/login');
  };

  const login = (token, email, fullname) => {
    redirectingToLogin = false;
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userFullname', fullname);
    setAuthState('authenticated');
  };

  // Initialize auth: validate token on app start
  useEffect(() => {
    let active = true;
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (active) setAuthState('unauthenticated');
        return;
      }

      try {
        // Validate token against backend by listing workspaces
        await listWorkspaces();
        if (active) setAuthState('authenticated');
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userFullname');
          localStorage.removeItem('currentWorkspaceId');
          localStorage.removeItem('currentWorkspaceName');
          localStorage.removeItem('currentWorkspaceRole');
          localStorage.removeItem('currentUserWorkspaceRole');
          if (active) setAuthState('unauthenticated');
        } else {
          // Keep token for non-401 errors (transient network issue) but default to unauthenticated state
          if (active) setAuthState('unauthenticated');
        }
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, []);

  // Listen to global 401 Unauthorized API responses
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userFullname');
      localStorage.removeItem('currentWorkspaceId');
      localStorage.removeItem('currentWorkspaceName');
      localStorage.removeItem('currentWorkspaceRole');
      localStorage.removeItem('currentUserWorkspaceRole');
      
      setAuthState('unauthenticated');

      if (window.location.pathname !== '/login' && !redirectingToLogin) {
        redirectingToLogin = true;
        const currentPath = window.location.pathname + window.location.search;
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
      }
    };

    const unsubscribe = subscribeTo401(handleUnauthorized);
    return () => unsubscribe();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ authState, setAuthState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
