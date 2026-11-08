import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  subscribeTo401,
  fetchCsrfToken,
  setInMemoryCsrfToken,
  clearInMemoryCsrfToken,
  getCsrfInitPromise
} from '../../api/apiClient';
import { listWorkspaces } from '../../api/workspaceApi';

const AuthContext = createContext(null);

let redirectingToLogin = false;

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState('initializing');
  const [csrfToken, setCsrfTokenState] = useState(null);
  const navigate = useNavigate();

  const setCsrfToken = (token) => {
    setCsrfTokenState(token);
    setInMemoryCsrfToken(token);
  };

  const logout = () => {
    redirectingToLogin = false;
    clearInMemoryCsrfToken();
    setCsrfTokenState(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullname');
    localStorage.removeItem('currentWorkspaceId');
    localStorage.removeItem('currentWorkspaceName');
    localStorage.removeItem('currentWorkspaceRole');
    localStorage.removeItem('currentUserWorkspaceRole');
    setAuthState('unauthenticated');
    navigate('/login');
  };

  /**
   * Called upon successful login.
   * Updates auth state and triggers GET /csrf asynchronously without blocking navigation to the dashboard.
   * Centralized promise in apiClient ensures state-changing requests await completion.
   */
  const login = (firstArg, secondArg, thirdArg) => {
    redirectingToLogin = false;

    let email = '';
    let fullname = '';

    // Handle flexible arguments: login(email, fullname) or legacy login(token, email, fullname) or login({ email, fullname })
    if (typeof firstArg === 'object' && firstArg !== null) {
      email = firstArg.email || '';
      fullname = firstArg.fullname || firstArg.fullName || '';
    } else if (typeof firstArg === 'string') {
      if (firstArg.startsWith('eyJ') && secondArg) {
        // Legacy call passing token as first argument
        email = secondArg;
        fullname = thirdArg || '';
      } else {
        email = firstArg;
        fullname = secondArg || '';
      }
    }

    const prevEmail = localStorage.getItem('userEmail');
    if (email && prevEmail && prevEmail.toLowerCase() !== email.toLowerCase()) {
      localStorage.removeItem('currentWorkspaceId');
      localStorage.removeItem('currentWorkspaceName');
      localStorage.removeItem('currentWorkspaceRole');
      localStorage.removeItem('currentUserWorkspaceRole');
    }

    if (email) localStorage.setItem('userEmail', email);
    if (fullname) localStorage.setItem('userFullname', fullname);

    setAuthState('authenticated');

    // Trigger GET /csrf asynchronously without blocking navigation to the dashboard
    fetchCsrfToken()
      .then((token) => {
        setCsrfToken(token);
      })
      .catch((err) => {
        console.error('Asynchronous CSRF initialization after login failed:', err);
      });
  };

  // Initialize auth & CSRF on app mount / page refresh
  useEffect(() => {
    let active = true;

    const checkAuthAndInitCsrf = async () => {
      // Trigger GET /csrf asynchronously on page refresh without blocking safe requests
      fetchCsrfToken()
        .then((token) => {
          if (active) setCsrfToken(token);
        })
        .catch(() => {
          // Handled if session is unauthenticated
        });

      try {
        // Safe GET request to validate existing session with backend (not blocked by CSRF promise)
        await listWorkspaces();
        if (active) {
          setAuthState('authenticated');
        }
      } catch (error) {
        if (!active) return;
        clearInMemoryCsrfToken();
        setCsrfTokenState(null);
        setAuthState('unauthenticated');
      }
    };

    checkAuthAndInitCsrf();

    return () => {
      active = false;
    };
  }, []);

  // Listen to global 401 Unauthorized API responses
  useEffect(() => {
    const handleUnauthorized = () => {
      clearInMemoryCsrfToken();
      setCsrfTokenState(null);
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userFullname');
      localStorage.removeItem('currentWorkspaceId');
      localStorage.removeItem('currentWorkspaceName');
      localStorage.removeItem('currentWorkspaceRole');
      localStorage.removeItem('currentUserWorkspaceRole');

      setAuthState('unauthenticated');

      const isPublicRoute =
        window.location.pathname === '/' ||
        window.location.pathname === '/documentation' ||
        window.location.pathname === '/login' ||
        window.location.pathname === '/signup' ||
        window.location.pathname === '/reset-password';

      if (!isPublicRoute && !redirectingToLogin) {
        redirectingToLogin = true;
        const currentPath = window.location.pathname + window.location.search;
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
      }
    };

    const unsubscribe = subscribeTo401(handleUnauthorized);
    return () => unsubscribe();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{
      authState,
      setAuthState,
      csrfToken,
      login,
      logout,
      refreshCsrfToken: fetchCsrfToken,
      csrfInitPromise: getCsrfInitPromise
    }}>
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
