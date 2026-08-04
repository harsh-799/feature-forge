import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import LandingPage from './pages/LandingPage/LandingPage'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'

// Import base React-Toastify styling
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>

      {/* Globally configured Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
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
