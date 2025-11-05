"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useSession, signIn, signOut } from "next-auth/react"

interface User {
  id: string
  email: string
  name: string
  role: "student" | "owner" | "admin"
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const user: User | null = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    avatar: session.user.image || undefined
  } : null

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      return result?.ok || false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isLoading: status === 'loading' 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Instead of throwing an error, return a safe default state
    console.warn("useAuth must be used within an AuthProvider. Returning default state.")
    return {
      user: null,
      login: async () => false,
      logout: () => {},
      isLoading: false
    }
  }
  return context
}
