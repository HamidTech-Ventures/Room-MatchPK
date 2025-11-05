"use client"

import { useState, useEffect, useCallback } from 'react'

// Type for the hook return value
type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((val: T) => T)) => void,
  () => void
]

/**
 * Custom hook for managing localStorage with TypeScript support
 * @param key - localStorage key
 * @param initialValue - default value if key doesn't exist
 * @param options - configuration options
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: {
    // Auto-save interval in milliseconds (0 = disabled)
    autoSaveInterval?: number
    // Custom serializer/deserializer
    serializer?: {
      stringify: (value: T) => string
      parse: (value: string) => T
    }
    // Sync across tabs
    syncAcrossTabs?: boolean
  } = {}
): UseLocalStorageReturn<T> {
  const {
    autoSaveInterval = 0,
    serializer = JSON,
    syncAcrossTabs = true
  } = options

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydration effect - runs only on client side after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key)
        if (item) {
          setStoredValue(serializer.parse(item))
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error)
      }
      setIsHydrated(true)
    }
  }, [key, serializer])

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to local storage only if hydrated
      if (typeof window !== 'undefined' && isHydrated) {
        window.localStorage.setItem(key, serializer.stringify(valueToStore))
        
        // Dispatch custom event for cross-tab sync
        if (syncAcrossTabs) {
          window.dispatchEvent(new CustomEvent(`localStorage-${key}`, {
            detail: valueToStore
          }))
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue, serializer, syncAcrossTabs, isHydrated])

  // Function to remove the item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined' && isHydrated) {
        window.localStorage.removeItem(key)
        
        if (syncAcrossTabs) {
          window.dispatchEvent(new CustomEvent(`localStorage-${key}`, {
            detail: initialValue
          }))
        }
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue, syncAcrossTabs, isHydrated])

  // Listen for changes to this localStorage key from other tabs
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(serializer.parse(e.newValue))
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error)
        }
      }
    }

    const handleCustomEvent = (e: CustomEvent) => {
      setStoredValue(e.detail)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(`localStorage-${key}`, handleCustomEvent as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(`localStorage-${key}`, handleCustomEvent as EventListener)
    }
  }, [key, serializer, syncAcrossTabs])

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveInterval <= 0 || !isHydrated) return

    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serializer.stringify(storedValue))
      }
    }, autoSaveInterval)

    return () => clearInterval(interval)
  }, [key, storedValue, autoSaveInterval, serializer, isHydrated])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook specifically for form data with additional form-specific utilities
 */
export function useFormLocalStorage<T extends Record<string, any>>(
  formKey: string,
  initialFormData: T,
  options: {
    // Auto-save on every change
    autoSave?: boolean
    // Fields to exclude from localStorage
    excludeFields?: (keyof T)[]
    // Debounce save in milliseconds
    debounceMs?: number
  } = {}
) {
  const {
    autoSave = true,
    excludeFields = [],
    debounceMs = 500
  } = options

  const [formData, setFormData, clearFormData] = useLocalStorage(
    `form-${formKey}`,
    initialFormData,
    {
      autoSaveInterval: autoSave ? debounceMs : 0,
      syncAcrossTabs: false // Forms are usually tab-specific
    }
  )

  // Enhanced setter that can handle field updates
  const updateFormData = useCallback((
    fieldOrUpdater: keyof T | Partial<T> | ((prev: T) => T),
    value?: any
  ) => {
    if (typeof fieldOrUpdater === 'function') {
      // Full updater function
      setFormData(fieldOrUpdater)
    } else if (typeof fieldOrUpdater === 'string' || typeof fieldOrUpdater === 'number' || typeof fieldOrUpdater === 'symbol') {
      // Single field update
      setFormData(prev => ({ ...prev, [fieldOrUpdater]: value }))
    } else if (fieldOrUpdater && typeof fieldOrUpdater === 'object') {
      // Partial object update
      setFormData(prev => ({ ...prev, ...fieldOrUpdater }))
    }
  }, [setFormData])

  // Get filtered data (excluding sensitive fields)
  const getCleanFormData = useCallback(() => {
    const filtered = { ...formData }
    excludeFields.forEach(field => {
      delete filtered[field]
    })
    return filtered
  }, [formData, excludeFields])

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setFormData(initialFormData)
  }, [setFormData, initialFormData])

  // Check if form has unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return JSON.stringify(getCleanFormData()) !== JSON.stringify(initialFormData)
  }, [getCleanFormData, initialFormData])

  return {
    formData,
    updateFormData,
    resetForm,
    clearFormData,
    getCleanFormData,
    hasUnsavedChanges
  }
}

/**
 * Hook for managing multiple form drafts
 */
export function useFormDrafts<T extends Record<string, any>>(
  formType: string,
  initialFormData: T
) {
  const [drafts, setDrafts] = useLocalStorage<Record<string, T & { savedAt: string, title?: string }>>(
    `form-drafts-${formType}`,
    {}
  )

  const saveDraft = useCallback((
    draftId: string,
    data: T,
    title?: string
  ) => {
    setDrafts(prev => ({
      ...prev,
      [draftId]: {
        ...data,
        savedAt: new Date().toISOString(),
        title: title || `Draft ${Object.keys(prev).length + 1}`
      }
    }))
  }, [setDrafts])

  const loadDraft = useCallback((draftId: string): T | null => {
    const draft = drafts[draftId]
    if (!draft) return null
    
    const { savedAt, title, ...formData } = draft
    return formData as unknown as T
  }, [drafts])

  const deleteDraft = useCallback((draftId: string) => {
    setDrafts(prev => {
      const { [draftId]: deleted, ...rest } = prev
      return rest
    })
  }, [setDrafts])

  const getDraftsList = useCallback(() => {
    return Object.entries(drafts).map(([id, draft]) => ({
      id,
      title: draft.title || `Draft ${id}`,
      savedAt: draft.savedAt,
      preview: JSON.stringify(draft).slice(0, 100) + '...'
    }))
  }, [drafts])

  return {
    saveDraft,
    loadDraft,
    deleteDraft,
    getDraftsList,
    draftsCount: Object.keys(drafts).length
  }
}

export default useLocalStorage