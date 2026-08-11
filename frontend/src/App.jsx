import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Root Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Placeholders for auth pages to prevent broken routes */}
        <Route 
          path="/login" 
          element={
            <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: 'var(--sans)' }}>
              <h2>Login Page</h2>
              <p style={{ color: 'var(--text-primary)', marginTop: '8px' }}>Authentication flows can be integrated here.</p>
              <a href="/" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}>← Back to Landing Page</a>
            </div>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: 'var(--sans)' }}>
              <h2>Get Started (Signup)</h2>
              <p style={{ color: 'var(--text-primary)', marginTop: '8px' }}>User registration flows can be integrated here.</p>
              <a href="/" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}>← Back to Landing Page</a>
            </div>
          } 
        />

        {/* Fallback redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
