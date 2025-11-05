"use client"

import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function DatabaseInitializer() {
  const [hasInitialized, setHasInitialized] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (hasInitialized) return

    const initializeDatabase = async () => {
      try {
        // Call the API endpoint to initialize database
        const response = await fetch('/api/database/init', {
          method: 'POST',
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          
          // Don't show error toast for missing configuration
          if (errorData.error?.includes('not configured') || errorData.error?.includes('MONGODB_URI')) {
            console.log('ℹ️ Database not configured - running in limited mode')
            return
          }
          
          // Only show toast for actual errors, not configuration issues
          if (errorData.error && !errorData.error.includes('not configured')) {
            toast({
              title: "Database Initialization",
              description: "Database features may be limited. Check console for details.",
              duration: 3000,
            })
          }
          return
        }

        const data = await response.json()
        if (data.success) {
          console.log('✅ Database initialized successfully')
        }
      } catch (error) {
        // Silently handle initialization errors - don't crash the app
        console.log('ℹ️ Database initialization skipped:', error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setHasInitialized(true)
      }
    }

    // Delay initialization to ensure the app has loaded
    const timer = setTimeout(initializeDatabase, 2000)
    return () => clearTimeout(timer)
  }, [hasInitialized, toast])

  return null
}