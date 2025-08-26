"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  studentRut: string
  studentEmail: string
  studentName: string
  studentCollege: string
  studentCertificateUrl: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Verificar si hay token en localStorage al cargar la app
    const storedToken = localStorage.getItem('authToken')
    if (storedToken) {
      setToken(storedToken)
      // Decodificar el token para obtener información del usuario
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]))
        setUser(payload)
      } catch (error) {
        console.error('Error decoding token:', error)
        logout()
      }
    }
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken)
    setToken(newToken)
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]))
      setUser(payload)
    } catch (error) {
      console.error('Error decoding token:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
    // También podrías hacer una llamada al backend para logout
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}