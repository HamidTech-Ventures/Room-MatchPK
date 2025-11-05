"use client"

import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ConfigStatus {
  configured: boolean
  services: {
    mongodb: boolean
    nextauth: boolean
    google: boolean
    jwt: boolean
  }
  message: string
}

export function ConfigurationChecker() {
  const [hasChecked, setHasChecked] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (hasChecked) return

    const checkConfiguration = async () => {
      try {
        const response = await fetch('/api/config/check')
        const data: ConfigStatus = await response.json()
        
        if (!data.configured) {
          // Show a single, friendly configuration message
          toast({
            title: "⚙️ Backend Configuration",
            description: "Please configure backend keys in .env.local file to enable all features. App will work with limited functionality.",
            duration: 6000,
          })

          // Show detailed missing services (less aggressive)
          const missingServices: string[] = []
          if (!data.services.mongodb) missingServices.push('MongoDB')
          if (!data.services.nextauth) missingServices.push('NextAuth Secret')
          if (!data.services.jwt) missingServices.push('JWT Secret')
          
          if (missingServices.length > 0) {
            setTimeout(() => {
              toast({
                title: "Configuration Details",
                description: `Missing: ${missingServices.join(', ')}. Check README.md for setup instructions.`,
                duration: 8000,
              })
            }, 3000)
          }

          // Optional services info (less prominent)
          if (!data.services.google) {
            setTimeout(() => {
              toast({
                title: "Optional: Google OAuth",
                description: "Google sign-in is disabled. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.",
                duration: 5000,
              })
            }, 6000)
          }
        } else {
          // Backend is properly configured - no need to show toast to users
          console.log('✅ All backend services are properly configured')
        }
      } catch (error) {
        console.log('Configuration check failed:', error)
        // Don't show error toast for configuration check failures
        // The app should work without this check
      } finally {
        setHasChecked(true)
      }
    }

    // Delay the check slightly to ensure the app has loaded
    const timer = setTimeout(checkConfiguration, 1000)
    return () => clearTimeout(timer)
  }, [hasChecked, toast])

  return null // This component doesn't render anything visible
}