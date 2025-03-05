"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call to authenticate
      // For demo purposes, we'll simulate a login
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
      const user = storedUsers.find((u: any) => u.email === email)

      if (!user || user.password !== password) {
        throw new Error("Invalid email or password")
      }

      const authenticatedUser = { id: user.id, email: user.email }
      localStorage.setItem("user", JSON.stringify(authenticatedUser))
      setUser(authenticatedUser)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call to register
      // For demo purposes, we'll simulate registration
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")

      if (storedUsers.some((u: any) => u.email === email)) {
        throw new Error("Email already in use")
      }

      const newUser = { id: Date.now().toString(), email, password }
      const updatedUsers = [...storedUsers, newUser]
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      const authenticatedUser = { id: newUser.id, email: newUser.email }
      localStorage.setItem("user", JSON.stringify(authenticatedUser))
      setUser(authenticatedUser)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

