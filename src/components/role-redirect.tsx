"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AuthLoading } from "@/components/auth-loading"

interface RoleRedirectProps {
  children?: React.ReactNode
}

export function RoleRedirect({ children }: RoleRedirectProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (session?.user) {
      const role = session.user.role
      
      // Define role-based redirect URLs - both students and owners can access both pages
      const roleRedirects = {
        student: "/find-rooms", // Students can still default to find-rooms but can access list-property
        owner: "/list-property", 
        admin: "/admin"
      }

      const redirectUrl = roleRedirects[role] || "/find-rooms"
      
      console.log(`Redirecting ${role} user to: ${redirectUrl}`)
      router.push(redirectUrl)
    }
  }, [session, status, router])

  // Show loading while redirecting
  if (status === "loading" || session?.user) {
    return (
      <AuthLoading 
        title={session?.user ? `Welcome ${session.user.name}!` : "Loading..."}
        description={session?.user ? `Taking you to your ${session.user.role} dashboard` : "Please wait"}
      />
    )
  }

  return <>{children}</>
}