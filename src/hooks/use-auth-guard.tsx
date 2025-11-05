"use client"

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

export function useAuthGuard() {
  const { user } = useAuth()
  const router = useRouter()

  const requireAuth = (action: string, currentPath: string = '/find-rooms') => {
    if (!user) {
      router.push('/auth/login')
      return false
    }
    return true
  }

  return { requireAuth, isAuthenticated: !!user }
}