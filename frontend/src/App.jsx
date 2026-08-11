import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Import base React-Toastify styling
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Root Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
    </BrowserRouter>
  )
}

export default App
