import { initializeDatabase, checkDatabaseHealth } from './db-init'

let isInitialized = false

export async function initializeApp(): Promise<{ success: boolean; message: string; error?: string }> {
  if (isInitialized) {
    console.log('🔄 Application already initialized')
    return { success: true, message: 'Already initialized' }
  }

  try {
    console.log('🚀 Starting application initialization...')
    
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      console.log('MongoDB URI not configured. Database features will be disabled.')
      console.log('ℹ️ To enable database features, set MONGODB_URI in your .env.local file')
      isInitialized = true
      return { success: false, message: 'MongoDB not configured', error: 'MONGODB_URI not configured' }
    }
    
    // Check database health first
    console.log('🔍 Checking database connection...')
    const health = await checkDatabaseHealth()
    
    if (!health.isConnected) {
      console.log('⚠️ Failed to connect to MongoDB database. App will run with limited functionality.')
      isInitialized = true
      return { success: false, message: 'Database connection failed', error: 'Failed to connect to database' }
    }
    
    console.log('✅ Database connection successful')
    console.log(`📊 Found ${health.collections.length} existing collections:`, health.collections)
    
    // Initialize database collections and schemas
    await initializeDatabase()
    
    isInitialized = true
    console.log('🎉 Application initialization completed successfully!')
    return { success: true, message: 'Database initialized successfully' }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.log('ℹ️ App will continue running with limited functionality:', errorMessage)
    isInitialized = true // Mark as initialized to prevent retries
    return { success: false, message: 'Initialization failed', error: errorMessage }
  }
}

export async function getAppStatus() {
  try {
    const health = await checkDatabaseHealth()
    return {
      initialized: isInitialized,
      database: {
        connected: health.isConnected,
        collections: health.collections,
        totalCollections: health.collections.length
      }
    }
  } catch (error) {
    return {
      initialized: false,
      database: {
        connected: false,
        collections: [],
        totalCollections: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Auto-initialize in development (silently)
if (process.env.NODE_ENV === 'development') {
  initializeApp().then((result) => {
    if (!result.success && result.error && !result.error.includes('not configured')) {
      console.log('ℹ️ Application initialization completed with limited functionality')
    }
  }).catch((error) => {
    console.log('ℹ️ Application will run with limited functionality:', error.message || 'Unknown error')
  })
}