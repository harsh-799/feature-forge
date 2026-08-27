import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Overview from './pages/Overview'
import FeatureFlags from './pages/FeatureFlags'
import FeatureNew from './pages/FeatureNew'
import FeatureDetails from './pages/FeatureDetails'
import Environments from './pages/Environments'
import Activity from './pages/Activity'
import WorkspaceMembers from './pages/WorkspaceMembers'
import AcceptInvite from './pages/AcceptInvite'
import AccountCenter from './pages/AccountCenter'
import DashboardLayout from './components/auth/DashboardLayout'

// Import base React-Toastify styling
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import { AuthProvider, useAuth } from './components/auth/AuthContext'


// Authentication Guard Component
function ProtectedRoute({ children }) {
  const { authState } = useAuth();

  if (authState === 'initializing') {
    return (
      <div className="initializing-spinner-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0a0a0c',
        color: '#FAF8F5',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(250, 248, 245, 0.1)',
            borderTop: '3px solid #ff7a00',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ margin: 0, fontSize: '14px', letterSpacing: '0.05em', color: '#888' }}>INITIALIZING...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    const currentPath = window.location.pathname + window.location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Landing Page Root Route */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Dashboard Workspace Onboarding */}
          <Route 
            path="/app/onboarding" 
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } 
          />

          {/* Protected Dashboard Layout and children */}
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="features" element={<FeatureFlags />} />
            <Route path="features/new" element={<FeatureNew />} />
            <Route path="features/:id" element={<FeatureDetails />} />
            <Route path="environments" element={<Environments />} />
            <Route path="activity" element={<Activity />} />
            <Route path="workspace/members" element={<WorkspaceMembers />} />
            <Route path="account" element={<AccountCenter />} />
          </Route>

          {/* Accept Collaboration Invitation page */}
          <Route 
            path="/accept-invite" 
            element={
              <ProtectedRoute>
                <AcceptInvite />
              </ProtectedRoute>
            } 
          />

          {/* Fallback redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Globally configured Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover
          theme="light"
          icon={({ type }) => {
            if (type === 'success') {
              return (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: '#FAF8F5' }}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="9 11 12 14 17 8" />
                </svg>
              );
            }
            if (type === 'error') {
              return (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: '#EF4444' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              );
            }
            return null;
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
