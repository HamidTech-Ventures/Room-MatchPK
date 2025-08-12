"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

export type UserRole = "student" | "owner" | "admin"

interface ProtectedRouteProps {
  children: ReactNode
  /**
   * If at least one role is supplied, the user must have one of these roles.
   * Leave empty (default) to allow any authenticated user.
   */
  allowedRoles?: UserRole[]
  /**
   * Where to send unauthenticated users.
   * Defaults to `/auth/login`.
   */
  redirectTo?: string
}

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export function ProtectedRoute({ children, allowedRoles = [], redirectTo = "/auth/login" }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  /* ---------------------------------- */
  /* 1. HANDLE REDIRECTS                */
  /* ---------------------------------- */
  useEffect(() => {
    if (isLoading) return // still figuring out auth state

    // 1. NOT LOGGED IN  ---------------------------------------------
    if (!user) {
      const target = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`
      if (pathname !== target) {
        router.push(target)
      }
      return
    }

    // 2. LOGGED IN BUT WRONG ROLE -----------------------------------
    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      if (pathname !== "/unauthorized") {
        router.push("/unauthorized")
      }
      return
    }
    // 3. LOGGED IN & PERMITTED – do nothing (allow render)
  }, [user, isLoading, pathname, router, redirectTo, allowedRoles])

  /* ---------------------------------- */
  /* 2. RENDER STATES                   */
  /* ---------------------------------- */

  // While we’re checking auth, show a spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  // If we get here and there’s still no user (edge-case) don’t flash the page
  if (!user) return null
  // If wrong role, don’t flash protected content either
  if (allowedRoles.length && !allowedRoles.includes(user.role)) return null

  return <>{children}</>
}

/* ------------------------------------------------------------------ */
/* DUAL EXPORT (named + default)                                       */
/* ------------------------------------------------------------------ */

export default ProtectedRoute
