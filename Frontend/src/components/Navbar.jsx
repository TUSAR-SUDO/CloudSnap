import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <nav className="navbar" id="main-navbar">
      <Link to="/feed" className="navbar-brand">
        <div className="logo-icon">☁️</div>
        <span>CloudSnap</span>
      </Link>
      <div className="navbar-links">
        <Link
          to="/feed"
          className={`nav-link ${location.pathname === '/feed' ? 'active' : ''}`}
          id="nav-feed"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>Gallery</span>
        </Link>
        <Link
          to="/create-post"
          className={`nav-link ${location.pathname === '/create-post' ? 'active' : ''}`}
          id="nav-create"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span>Upload</span>
        </Link>

        {/* User section */}
        {user && (
          <div className="nav-user-section">
            <div className="nav-avatar" id="nav-avatar" title={user.fullName}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <button
              className="nav-logout-btn"
              onClick={handleLogout}
              id="nav-logout"
              title="Logout"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
