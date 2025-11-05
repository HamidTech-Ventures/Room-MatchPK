import { useState, useCallback } from 'react'

export interface LoaderState {
  isLoading: boolean
  success: boolean
  error: boolean
}

export interface ImageLoaderHook {
  uploadState: LoaderState
  deleteState: LoaderState
  startUpload: () => void
  uploadSuccess: () => void
  uploadError: () => void
  startDelete: () => void
  deleteSuccess: () => void
  deleteError: () => void
}

export function useImageLoader(): ImageLoaderHook {
  const [uploadState, setUploadState] = useState<LoaderState>({
    isLoading: false,
    success: false,
    error: false
  })

  const [deleteState, setDeleteState] = useState<LoaderState>({
    isLoading: false,
    success: false,
    error: false
  })

  const startUpload = useCallback(() => {
    setUploadState({ isLoading: true, success: false, error: false })
  }, [])

  const uploadSuccess = useCallback(() => {
    setUploadState({ isLoading: false, success: true, error: false })
    // Auto-hide success state after 2 seconds
    setTimeout(() => {
      setUploadState({ isLoading: false, success: false, error: false })
    }, 2000)
  }, [])

  const uploadError = useCallback(() => {
    setUploadState({ isLoading: false, success: false, error: true })
    // Auto-hide error state after 3 seconds
    setTimeout(() => {
      setUploadState({ isLoading: false, success: false, error: false })
    }, 3000)
  }, [])

  const startDelete = useCallback(() => {
    setDeleteState({ isLoading: true, success: false, error: false })
  }, [])

  const deleteSuccess = useCallback(() => {
    setDeleteState({ isLoading: false, success: true, error: false })
    // Auto-hide success state after 2 seconds
    setTimeout(() => {
      setDeleteState({ isLoading: false, success: false, error: false })
    }, 2000)
  }, [])

  const deleteError = useCallback(() => {
    setDeleteState({ isLoading: false, success: false, error: true })
    // Auto-hide error state after 3 seconds
    setTimeout(() => {
      setDeleteState({ isLoading: false, success: false, error: false })
    }, 3000)
  }, [])

  return {
    uploadState,
    deleteState,
    startUpload,
    uploadSuccess,
    uploadError,
    startDelete,
    deleteSuccess,
    deleteError
  }
}