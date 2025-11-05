"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { AuthLoading } from "@/components/auth-loading"

export default function AuthCallbackPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (status === "loading") return

    const error = searchParams.get('error')
    const intent = searchParams.get('intent') // 'login' or 'signup'
    
    if (error) {
      console.error('Auth callback error:', error)
      toast.error("Authentication failed", {
        description: "There was a problem signing you in. Please try again."
      })
      router.push('/auth/login')
      return
    }

    if (session?.user) {
      const role = session.user.role
      const isNewUser = session.user.isNewUser
      const returnUrl = searchParams.get('returnUrl')
      
      console.log('User session found:', { 
        name: session.user.name, 
        email: session.user.email, 
        role: session.user.role,
        intent: intent,
        isNewUser: isNewUser,
        returnUrl: returnUrl
      })
      
      // Handle new Google users who tried to login
      if (isNewUser && intent === 'login') {
        console.log('New Google user tried to login, showing create account message')
        toast.info("Account Created Successfully!", {
          description: `Welcome ${session.user.name}! Your account has been created. You can now sign in with Google anytime.`,
          duration: 5000
        })
      } else if (intent === 'login') {
        console.log('Existing Google user login for:', session.user.email)
      } else if (intent === 'signup' || isNewUser) {
        console.log('Google signup completed for:', session.user.email)
      }
      
      // Determine redirect URL - returnUrl takes priority
      let redirectUrl
      if (returnUrl) {
        try {
          const decodedUrl = decodeURIComponent(returnUrl)
          // Ensure it's a relative URL for security
          if (decodedUrl.startsWith('/') && !decodedUrl.startsWith('//')) {
            redirectUrl = decodedUrl
          }
        } catch (error) {
          console.error('Invalid return URL:', error)
        }
      }
      
      // Fallback to role-based redirect if no valid return URL
      if (!redirectUrl) {
        const roleRedirects = {
          student: "/find-rooms",
          owner: "/list-property",
          admin: "/admin"
        }
        redirectUrl = roleRedirects[role] || "/find-rooms"
      }
      
      let successMessage
      if (isNewUser && intent === 'login') {
        successMessage = `Account created successfully! Welcome ${session.user.name}!`
      } else if (intent === 'signup' || isNewUser) {
        successMessage = `Account created successfully! Welcome ${session.user.name}!`
      } else {
        successMessage = `Welcome back ${session.user.name}!`
      }
      
      toast.success("Authentication successful!", {
        description: `${successMessage} Redirecting...`
      })
      
      console.log(`Redirecting ${role} user to: ${redirectUrl}`)
      
      // Small delay to show the success message
      setTimeout(() => {
        router.push(redirectUrl)
      }, 1500)
    } else {
      // No session, redirect to login
      console.log('No session found, redirecting to login')
      setTimeout(() => {
        router.push('/auth/login')
      }, 1000)
    }
  }, [session, status, router, searchParams])

  if (status === "loading") {
    return (
      <AuthLoading 
        title="Authenticating..." 
        description="Please wait while we verify your credentials" 
        fullScreen={true}
      />
    )
  }

  if (session?.user) {
    return (
      <AuthLoading 
        title={`Welcome ${session.user.name}!`}
        description={`Redirecting to your ${session.user.role} dashboard...`}
        fullScreen={true}
      />
    )
  }

  return (
    <AuthLoading 
      title="Redirecting..." 
      description="Taking you back to login" 
      fullScreen={true}
    />
  )
}