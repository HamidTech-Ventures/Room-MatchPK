"use client"

import React from 'react'
import { Upload, Trash2, Check, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageLoaderProps {
  isLoading?: boolean
  type?: 'upload' | 'delete'
  success?: boolean
  error?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  message?: string
}

export function ImageLoader({
  isLoading = false,
  type = 'upload',
  success = false,
  error = false,
  size = 'md',
  className,
  message
}: ImageLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const getIcon = () => {
    if (success) return <Check className={iconSizes[size]} />
    if (error) return <X className={iconSizes[size]} />
    if (type === 'delete') return <Trash2 className={iconSizes[size]} />
    return <Upload className={iconSizes[size]} />
  }

  const getColors = () => {
    if (success) return 'from-emerald-500 to-emerald-600 text-white'
    if (error) return 'from-red-500 to-red-600 text-white'
    if (type === 'delete') return 'from-red-500 to-red-600 text-white'
    return 'from-emerald-500 to-blue-600 text-white'
  }

  const getMessage = () => {
    if (message) return message
    if (success) return type === 'upload' ? 'Uploaded!' : 'Deleted!'
    if (error) return type === 'upload' ? 'Upload failed' : 'Delete failed'
    return type === 'upload' ? 'Uploading...' : 'Deleting...'
  }

  if (!isLoading && !success && !error) return null

  return (
    <div className={cn(
      "fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50",
      className
    )}>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-200/50 max-w-sm mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Loader Icon */}
          <div className={cn(
            "relative rounded-2xl flex items-center justify-center shadow-lg",
            sizeClasses[size],
            `bg-gradient-to-br ${getColors()}`
          )}>
            {isLoading && !success && !error && (
              <div className="absolute inset-0 rounded-2xl">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/30 to-emerald-400/30 animate-pulse"></div>
                <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 animate-spin-slow"></div>
              </div>
            )}
            <div className="relative z-10">
              {getIcon()}
            </div>
            
            {/* Success/Error ping animation */}
            {(success || error) && (
              <div className={cn(
                "absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping",
                success ? "bg-emerald-400" : error ? "bg-red-400" : "bg-purple-400"
              )}></div>
            )}
          </div>

          {/* Message */}
          <div className="text-center">
            <p className={cn(
              "font-semibold text-slate-800",
              textSizes[size]
            )}>
              {getMessage()}
            </p>
            
            {/* Progress indicator for loading */}
            {isLoading && !success && !error && (
              <div className="mt-3 w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Specialized components for common use cases
export function UploadLoader({ 
  isLoading, 
  success, 
  error, 
  size = 'md',
  message 
}: Omit<ImageLoaderProps, 'type'>) {
  return (
    <ImageLoader
      type="upload"
      isLoading={isLoading}
      success={success}
      error={error}
      size={size}
      message={message}
    />
  )
}

export function DeleteLoader({ 
  isLoading, 
  success, 
  error, 
  size = 'md',
  message 
}: Omit<ImageLoaderProps, 'type'>) {
  return (
    <ImageLoader
      type="delete"
      isLoading={isLoading}
      success={success}
      error={error}
      size={size}
      message={message}
    />
  )
}

// Hook for managing loader states
export function useImageLoader() {
  const [uploadState, setUploadState] = React.useState<{
    isLoading: boolean
    success: boolean
    error: boolean
  }>({
    isLoading: false,
    success: false,
    error: false
  })

  const [deleteState, setDeleteState] = React.useState<{
    isLoading: boolean
    success: boolean
    error: boolean
  }>({
    isLoading: false,
    success: false,
    error: false
  })

  const startUpload = () => {
    setUploadState({ isLoading: true, success: false, error: false })
  }

  const uploadSuccess = () => {
    setUploadState({ isLoading: false, success: true, error: false })
    setTimeout(() => {
      setUploadState({ isLoading: false, success: false, error: false })
    }, 2000)
  }

  const uploadError = () => {
    setUploadState({ isLoading: false, success: false, error: true })
    setTimeout(() => {
      setUploadState({ isLoading: false, success: false, error: false })
    }, 3000)
  }

  const startDelete = () => {
    setDeleteState({ isLoading: true, success: false, error: false })
  }

  const deleteSuccess = () => {
    setDeleteState({ isLoading: false, success: true, error: false })
    setTimeout(() => {
      setDeleteState({ isLoading: false, success: false, error: false })
    }, 2000)
  }

  const deleteError = () => {
    setDeleteState({ isLoading: false, success: false, error: true })
    setTimeout(() => {
      setDeleteState({ isLoading: false, success: false, error: false })
    }, 3000)
  }

  const resetUpload = () => {
    setUploadState({ isLoading: false, success: false, error: false })
  }

  const resetDelete = () => {
    setDeleteState({ isLoading: false, success: false, error: false })
  }

  return {
    uploadState,
    deleteState,
    startUpload,
    uploadSuccess,
    uploadError,
    startDelete,
    deleteSuccess,
    deleteError,
    resetUpload,
    resetDelete
  }
}