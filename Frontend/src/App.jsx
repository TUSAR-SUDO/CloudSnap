import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import CreatePost from './pages/CreatePost.jsx'
import Feed from './pages/Feed.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import FireBackground from './components/FireBackground.jsx'

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing page — full-screen hero, no navbar */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth page — login/register */}
          <Route path="/auth" element={<AuthPage />} />

          {/* App pages with navbar — protected */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Navbar />
              <div className="page-wrapper">
                <FireBackground intensity="low" enableEmbers={true} enableSparkles={true} />
                <Routes>
                  <Route path="/create-post" element={<CreatePost />} />
                  <Route path="/feed" element={<Feed />} />
                </Routes>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App