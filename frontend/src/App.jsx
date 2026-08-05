import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import LandingPage from './pages/LandingPage/LandingPage'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Onboarding from './pages/Onboarding/Onboarding'
import DashboardLayout from './components/DashboardLayout/DashboardLayout'
import Overview from './pages/Overview/Overview'
import FeatureFlags from './pages/FeatureFlags/FeatureFlags'
import FeatureNew from './pages/FeatureNew/FeatureNew'
import FeatureDetails from './pages/FeatureDetails/FeatureDetails'
import Environments from './pages/Environments/Environments'
import Activity from './pages/Activity/Activity'
import WorkspaceMembers from './pages/WorkspaceMembers/WorkspaceMembers'

// Import base React-Toastify styling
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

// Helper component to guard authenticated routes
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Onboarding Flow */}
        <Route
          path="/app/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Dashboard Layout Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default child redirects to /app/features */}
          <Route index element={<Navigate to="/app/features" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="features" element={<FeatureFlags />} />
          <Route path="features/new" element={<FeatureNew />} />
          <Route path="features/:id" element={<FeatureDetails />} />
          <Route path="environments" element={<Environments />} />
          <Route path="activity" element={<Activity />} />
          <Route path="workspace/members" element={<WorkspaceMembers />} />
        </Route>

        {/* Fallback redirect */}
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
          return true; // default icon for other types
        }}
      />
    </BrowserRouter>
  )
}

export default App
