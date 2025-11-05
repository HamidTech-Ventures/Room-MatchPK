"use client"

import { useLocalStorage } from './use-local-storage'

// User preference types
export interface UserPreferences {
  // UI Preferences
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'ur' | 'auto'
  viewMode: 'grid' | 'list'
  
  // Search & Filter Preferences
  defaultLocation: string
  preferredPropertyTypes: string[]
  defaultPriceRange: [number, number]
  favoriteAmenities: string[]
  
  // Notification Preferences
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  
  // Display Preferences
  currency: 'PKR' | 'USD'
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'
  
  // Chat Preferences
  chatSounds: boolean
  showOnlineStatus: boolean
  autoMarkAsRead: boolean
  
  // Privacy Preferences
  profileVisibility: 'public' | 'private' | 'friends'
  showContactInfo: boolean
  allowPropertyRecommendations: boolean
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'auto',
  viewMode: 'grid',
  defaultLocation: '',
  preferredPropertyTypes: [],
  defaultPriceRange: [5000, 50000],
  favoriteAmenities: [],
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  marketingEmails: false,
  currency: 'PKR',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  chatSounds: true,
  showOnlineStatus: true,
  autoMarkAsRead: true,
  profileVisibility: 'public',
  showContactInfo: true,
  allowPropertyRecommendations: true
}

/**
 * Hook for managing user preferences with localStorage persistence
 */
export function useUserPreferences() {
  const [preferences, setPreferences, clearPreferences] = useLocalStorage<UserPreferences>(
    'user-preferences',
    defaultPreferences,
    {
      autoSaveInterval: 1000, // Auto-save every second
      syncAcrossTabs: true
    }
  )

  // Helper functions for specific preference categories
  const updateUIPreferences = (updates: Partial<Pick<UserPreferences, 'theme' | 'language' | 'viewMode'>>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  const updateSearchPreferences = (updates: Partial<Pick<UserPreferences, 'defaultLocation' | 'preferredPropertyTypes' | 'defaultPriceRange' | 'favoriteAmenities'>>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  const updateNotificationPreferences = (updates: Partial<Pick<UserPreferences, 'emailNotifications' | 'pushNotifications' | 'smsNotifications' | 'marketingEmails'>>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  const updateDisplayPreferences = (updates: Partial<Pick<UserPreferences, 'currency' | 'dateFormat' | 'timeFormat'>>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  const updateChatPreferences = (updates: Partial<Pick<UserPreferences, 'chatSounds' | 'showOnlineStatus' | 'autoMarkAsRead'>>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  const updatePrivacyPreferences = (updates: Partial<Pick<UserPreferences, 'profileVisibility' | 'showContactInfo' | 'allowPropertyRecommendations'>>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  // Toggle functions for boolean preferences
  const toggleTheme = () => {
    const themes: Array<UserPreferences['theme']> = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(preferences.theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    updateUIPreferences({ theme: nextTheme })
  }

  const toggleViewMode = () => {
    updateUIPreferences({ viewMode: preferences.viewMode === 'grid' ? 'list' : 'grid' })
  }

  const toggleNotification = (type: keyof Pick<UserPreferences, 'emailNotifications' | 'pushNotifications' | 'smsNotifications' | 'marketingEmails'>) => {
    updateNotificationPreferences({ [type]: !preferences[type] })
  }

  // Reset functions
  const resetToDefaults = () => {
    setPreferences(defaultPreferences)
  }

  const resetCategory = (category: 'ui' | 'search' | 'notifications' | 'display' | 'chat' | 'privacy') => {
    switch (category) {
      case 'ui':
        updateUIPreferences({
          theme: defaultPreferences.theme,
          language: defaultPreferences.language,
          viewMode: defaultPreferences.viewMode
        })
        break
      case 'search':
        updateSearchPreferences({
          defaultLocation: defaultPreferences.defaultLocation,
          preferredPropertyTypes: defaultPreferences.preferredPropertyTypes,
          defaultPriceRange: defaultPreferences.defaultPriceRange,
          favoriteAmenities: defaultPreferences.favoriteAmenities
        })
        break
      case 'notifications':
        updateNotificationPreferences({
          emailNotifications: defaultPreferences.emailNotifications,
          pushNotifications: defaultPreferences.pushNotifications,
          smsNotifications: defaultPreferences.smsNotifications,
          marketingEmails: defaultPreferences.marketingEmails
        })
        break
      case 'display':
        updateDisplayPreferences({
          currency: defaultPreferences.currency,
          dateFormat: defaultPreferences.dateFormat,
          timeFormat: defaultPreferences.timeFormat
        })
        break
      case 'chat':
        updateChatPreferences({
          chatSounds: defaultPreferences.chatSounds,
          showOnlineStatus: defaultPreferences.showOnlineStatus,
          autoMarkAsRead: defaultPreferences.autoMarkAsRead
        })
        break
      case 'privacy':
        updatePrivacyPreferences({
          profileVisibility: defaultPreferences.profileVisibility,
          showContactInfo: defaultPreferences.showContactInfo,
          allowPropertyRecommendations: defaultPreferences.allowPropertyRecommendations
        })
        break
    }
  }

  // Export/Import preferences
  const exportPreferences = () => {
    return JSON.stringify(preferences, null, 2)
  }

  const importPreferences = (preferencesJson: string) => {
    try {
      const imported = JSON.parse(preferencesJson)
      setPreferences({ ...defaultPreferences, ...imported })
      return true
    } catch (error) {
      console.error('Failed to import preferences:', error)
      return false
    }
  }

  return {
    preferences,
    setPreferences,
    clearPreferences,
    
    // Category updaters
    updateUIPreferences,
    updateSearchPreferences,
    updateNotificationPreferences,
    updateDisplayPreferences,
    updateChatPreferences,
    updatePrivacyPreferences,
    
    // Toggle functions
    toggleTheme,
    toggleViewMode,
    toggleNotification,
    
    // Reset functions
    resetToDefaults,
    resetCategory,
    
    // Import/Export
    exportPreferences,
    importPreferences
  }
}

export default useUserPreferences