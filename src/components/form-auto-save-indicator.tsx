"use client"

import React from 'react'
import { CheckCircle, Clock, AlertCircle, Save } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface FormAutoSaveIndicatorProps {
  hasUnsavedChanges: boolean
  isSaving?: boolean
  lastSaved?: Date | null
  error?: string | null
  variant?: 'default' | 'compact' | 'badge'
  className?: string
}

export function FormAutoSaveIndicator({
  hasUnsavedChanges,
  isSaving = false,
  lastSaved = null,
  error = null,
  variant = 'default',
  className = ''
}: FormAutoSaveIndicatorProps) {
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 10) return 'just now'
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  // Don't show anything if no changes and no error
  if (!hasUnsavedChanges && !error && !lastSaved) {
    return null
  }

  // Error state
  if (error) {
    if (variant === 'badge') {
      return (
        <Badge variant="destructive" className={`flex items-center space-x-1 ${className}`}>
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">Save failed</span>
        </Badge>
      )
    }

    if (variant === 'compact') {
      return (
        <div className={`flex items-center space-x-1 text-red-600 text-xs ${className}`}>
          <AlertCircle className="w-3 h-3" />
          <span>Failed to save</span>
        </div>
      )
    }

    return (
      <div className={`flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg text-sm ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <div>
          <div className="font-medium">Save Failed</div>
          <div className="text-xs opacity-75">{error}</div>
        </div>
      </div>
    )
  }

  // Saving state
  if (isSaving) {
    if (variant === 'badge') {
      return (
        <Badge className={`flex items-center space-x-1 bg-blue-100 text-blue-700 ${className}`}>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-xs">Saving...</span>
        </Badge>
      )
    }

    if (variant === 'compact') {
      return (
        <div className={`flex items-center space-x-1 text-blue-600 text-xs ${className}`}>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span>Saving...</span>
        </div>
      )
    }

    return (
      <div className={`flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg text-sm ${className}`}>
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
        <span>Auto-saving changes...</span>
      </div>
    )
  }

  // Has unsaved changes
  if (hasUnsavedChanges) {
    if (variant === 'badge') {
      return (
        <Badge className={`flex items-center space-x-1 bg-amber-100 text-amber-700 ${className}`}>
          <Clock className="w-3 h-3" />
          <span className="text-xs">Pending</span>
        </Badge>
      )
    }

    if (variant === 'compact') {
      return (
        <div className={`flex items-center space-x-1 text-amber-600 text-xs ${className}`}>
          <Clock className="w-3 h-3" />
          <span>Unsaved changes</span>
        </div>
      )
    }

    return (
      <div className={`flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-sm ${className}`}>
        <Clock className="w-4 h-4" />
        <span>You have unsaved changes</span>
      </div>
    )
  }

  // Saved state
  if (lastSaved) {
    if (variant === 'badge') {
      return (
        <Badge className={`flex items-center space-x-1 bg-green-100 text-green-700 ${className}`}>
          <CheckCircle className="w-3 h-3" />
          <span className="text-xs">Saved</span>
        </Badge>
      )
    }

    if (variant === 'compact') {
      return (
        <div className={`flex items-center space-x-1 text-green-600 text-xs ${className}`}>
          <CheckCircle className="w-3 h-3" />
          <span>Saved {getTimeAgo(lastSaved)}</span>
        </div>
      )
    }

    return (
      <div className={`flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm ${className}`}>
        <CheckCircle className="w-4 h-4" />
        <span>All changes saved {getTimeAgo(lastSaved)}</span>
      </div>
    )
  }

  return null
}

export default FormAutoSaveIndicator