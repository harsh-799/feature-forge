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
      />
    </BrowserRouter>
  )
}

export default App
