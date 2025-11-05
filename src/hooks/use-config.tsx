"use client"

import { useState, useEffect } from 'react'
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

export function useConfig() {
  const [config, setConfig] = useState<ConfigStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/config/check')
      const data = await response.json()
      setConfig(data)
      
      if (!data.configured) {
        toast({
          title: "Configuration Required",
          description: "Please configure backend keys in .env.local file",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to check configuration:', error)
      toast({
        title: "Configuration Check Failed",
        description: "Unable to verify backend configuration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    config,
    isLoading,
    isConfigured: config?.configured || false,
    recheckConfig: checkConfiguration
  }
}