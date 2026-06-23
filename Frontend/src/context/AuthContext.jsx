import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_URL = ''

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('cloudsnap_token'))
  const [loading, setLoading] = useState(true)

  // Set axios default header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('cloudsnap_token', token)
    } else {
      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('cloudsnap_token')
    }
  }, [token])

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await axios.get(`${API_URL}/auth/me`)
        setUser(res.data.user)
      } catch (err) {
        console.error('Session restore failed:', err)
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password })
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const register = async (fullName, email, password) => {
    const res = await axios.post(`${API_URL}/auth/register`, { fullName, email, password })
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
