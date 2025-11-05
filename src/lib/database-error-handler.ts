// Safe toast function that only works on client side
function safeToast(toastConfig: any) {
  // Only show toast on client side
  if (typeof window !== 'undefined') {
    // Dynamic import to avoid server-side execution
    import('@/hooks/use-toast').then(({ toast }) => {
      toast(toastConfig)
    }).catch(err => {
      console.warn('Failed to show toast:', err)
    })
  }
}

export function handleDatabaseError(error: any, operation: string = 'operation') {
  console.error(`Database ${operation} failed:`, error)
  
  const errorMessage = error?.message || 'Unknown error occurred'
  
  if (errorMessage.includes('not configured') || errorMessage.includes('MONGODB_URI')) {
    safeToast({
      title: "⚠️ Database Not Configured",
      description: "Please configure MongoDB in your environment settings to use this feature.",
      variant: "destructive",
      duration: 5000,
    })
  } else if (errorMessage.includes('connection') || errorMessage.includes('connect')) {
    safeToast({
      title: "🔌 Connection Error",
      description: "Unable to connect to the database. Please check your connection and try again.",
      variant: "destructive",
      duration: 5000,
    })
  } else if (errorMessage.includes('already exists')) {
    safeToast({
      title: "⚠️ Already Exists",
      description: "This item already exists in the database.",
      variant: "destructive",
      duration: 4000,
    })
  } else if (errorMessage.includes('not found')) {
    safeToast({
      title: "🔍 Not Found",
      description: "The requested item was not found.",
      variant: "destructive",
      duration: 4000,
    })
  } else {
    safeToast({
      title: `❌ ${operation.charAt(0).toUpperCase() + operation.slice(1)} Failed`,
      description: "An error occurred while processing your request. Please try again.",
      variant: "destructive",
      duration: 5000,
    })
  }
}

export function showDatabaseUnavailableMessage() {
  safeToast({
    title: "⚠️ Database Unavailable",
    description: "Database features are currently unavailable. Please configure MongoDB to enable full functionality.",
    variant: "destructive",
    duration: 6000,
  })
}

export function showOfflineModeMessage() {
  safeToast({
    title: "📱 Offline Mode",
    description: "You're currently in offline mode. Some features may be limited.",
    duration: 4000,
  })
}