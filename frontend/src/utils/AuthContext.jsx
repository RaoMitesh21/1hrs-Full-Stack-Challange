import React, { createContext, useContext, useState, useCallback } from 'react'
import { setAuth } from './api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ai_token'))

  const login = useCallback((newToken) => {
    localStorage.setItem('ai_token', newToken)
    setAuth(newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ai_token')
    setAuth(null)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, loggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
