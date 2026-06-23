import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FireBackground from '../components/FireBackground'

const AuthPage = () => {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, type: '', message: '' })

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  })

  const showToast = (type, message) => {
    setToast({ show: true, type, message })
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3500)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
        showToast('success', '✨ Welcome back!')
      } else {
        if (!formData.fullName.trim()) {
          showToast('error', '⚠️ Please enter your full name')
          setIsSubmitting(false)
          return
        }
        await register(formData.fullName, formData.email, formData.password)
        showToast('success', '🎉 Account created!')
      }
      setTimeout(() => navigate('/feed'), 600)
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong'
      showToast('error', `❌ ${msg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({ fullName: '', email: '', password: '' })
    setShowPassword(false)
  }

  return (
    <section className="auth-section" id="auth-page">
      {/* Fire canvas background */}
      <FireBackground intensity="medium" enableEmbers={true} enableSparkles={true} />

      {/* Animated flame orbs */}
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />
      <div className="auth-orb auth-orb--3" />

      {/* Mesh gradient overlay */}
      <div className="auth-mesh" />

      {/* Floating flame particles (CSS) */}
      <div className="auth-particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="auth-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
            }}
          />
        ))}
      </div>

      <div className="auth-container">
        {/* Brand header */}
        <Link to="/" className="auth-brand" id="auth-brand-link">
          <div className="auth-brand-icon">☁️</div>
          <span className="auth-brand-name">CloudSnap</span>
        </Link>

        {/* Auth card */}
        <div className="auth-card" id="auth-card">
          <div className="auth-card-glow" />
          <div className="auth-card-glow-bottom" />

          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="auth-subtitle">
              {isLogin
                ? 'Sign in to access your cloud gallery'
                : 'Join CloudSnap and start uploading'}
            </p>
          </div>

          {/* Toggle tabs */}
          <div className="auth-tabs" id="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => toggleMode()}
              type="button"
              id="login-tab"
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => toggleMode()}
              type="button"
              id="register-tab"
            >
              Sign Up
            </button>
            <div className={`auth-tab-indicator ${!isLogin ? 'right' : ''}`} />
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} id="auth-form">
            {/* Full Name - only for register */}
            <div className={`auth-field-wrapper ${!isLogin ? 'visible' : ''}`}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="fullName">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="auth-input"
                  autoComplete="name"
                  tabIndex={isLogin ? -1 : 0}
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="auth-input"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="password">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Password
              </label>
              <div className="auth-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  placeholder={isLogin ? '••••••••' : 'Min 6 characters'}
                  value={formData.password}
                  onChange={handleChange}
                  className="auth-input"
                  required
                  minLength={6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  id="password-toggle"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
              id="auth-submit"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {isLogin ? (
                      <>
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </>
                    ) : (
                      <>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                      </>
                    )}
                  </svg>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Footer toggle */}
          <p className="auth-footer">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button type="button" className="auth-toggle-link" onClick={toggleMode} id="auth-toggle">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Back to home */}
        <Link to="/" className="auth-back-link" id="back-home-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to home
        </Link>
      </div>

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`} id="auth-toast">
        {toast.message}
      </div>
    </section>
  )
}

export default AuthPage
