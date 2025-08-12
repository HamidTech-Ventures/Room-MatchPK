import { NextRequest, NextResponse } from 'next/server'
import { initializeApp } from '@/lib/startup'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Manual database initialization requested...')
    
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      console.log('MongoDB URI not configured. Database features will be disabled.')
      return NextResponse.json({
        success: false,
        message: 'Database not configured',
        error: 'MONGODB_URI not configured',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }
    
    const result = await initializeApp()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }
  } catch (error) {
    console.log('Database initialization error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Database initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: false,
        message: 'Database not configured',
        data: {
          database: {
            connected: false,
            name: 'hostelManagement',
            collections: [],
            totalCollections: 0,
            indexes: []
          },
          timestamp: new Date().toISOString()
        }
      })
    }

    const { checkDatabaseHealth } = await import('@/lib/db-init')
    const health = await checkDatabaseHealth()
    
    return NextResponse.json({
      success: true,
      data: {
        database: {
          connected: health.isConnected,
          name: 'hostelManagement',
          collections: health.collections,
          totalCollections: health.collections.length,
          indexes: health.indexes || []
        },
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.log('Database health check error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Database health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}