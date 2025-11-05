"use client"

import { useEffect, useState } from 'react'
import { handleDatabaseError, showDatabaseUnavailableMessage } from '@/lib/database-error-handler'
import { AuthLoading } from '@/components/auth-loading'

interface DatabaseWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showUnavailableMessage?: boolean
}

export function DatabaseWrapper({ 
  children, 
  fallback = null, 
  showUnavailableMessage = false 
}: DatabaseWrapperProps) {
  const [isDatabaseAvailable, setIsDatabaseAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const response = await fetch('/api/config/check')
        const data = await response.json()
        
        const isAvailable = data.configured && data.services.mongodb
        setIsDatabaseAvailable(isAvailable)
        
        if (!isAvailable && showUnavailableMessage) {
          showDatabaseUnavailableMessage()
        }
      } catch (error) {
        console.error('Failed to check database status:', error)
        setIsDatabaseAvailable(false)
        if (showUnavailableMessage) {
          handleDatabaseError(error, 'database check')
        }
      }
    }

    checkDatabase()
  }, [showUnavailableMessage])

  // Show loading state while checking
  if (isDatabaseAvailable === null) {
    return <AuthLoading title="Checking Database" description="Verifying database connection..." />
  }

  // Show fallback if database is not available
  if (!isDatabaseAvailable && fallback) {
    return <>{fallback}</>
  }

  // Show children if database is available, or if no fallback is provided
  return <>{children}</>
}

// Higher-order component for database operations
export function withDatabaseErrorHandling<T extends object>(
  Component: React.ComponentType<T>,
  fallbackComponent?: React.ComponentType<T>
) {
  return function WrappedComponent(props: T) {
    const FallbackComponent = fallbackComponent
    return (
      <DatabaseWrapper 
        fallback={FallbackComponent ? <FallbackComponent {...props} /> : undefined}
      >
        <Component {...props} />
      </DatabaseWrapper>
    )
  }
}

// Hook for database operations with error handling
export function useDatabaseOperation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeOperation = async <T,>(
    operation: () => Promise<T>,
    operationName: string = 'operation'
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await operation()
      return result
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown error occurred'
      setError(errorMessage)
      handleDatabaseError(err, operationName)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    executeOperation,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}