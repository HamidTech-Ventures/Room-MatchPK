'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface DatabaseStatus {
  connected: boolean
  name: string
  collections: string[]
  totalCollections: number
  indexes: Record<string, any[]>
}

interface ApiResponse {
  success: boolean
  data?: {
    database: DatabaseStatus
    timestamp: string
  }
  message?: string
  error?: string
}

export default function DatabaseManagementPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)

  const fetchDatabaseStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/database/init')
      const data: ApiResponse = await response.json()
      
      if (data.success && data.data) {
        setStatus(data.data.database)
      } else {
        toast.error(data.message || 'Failed to fetch database status')
      }
    } catch (error) {
      console.error('Error fetching database status:', error)
      toast.error('Failed to fetch database status')
    } finally {
      setLoading(false)
    }
  }

  const initializeDatabase = async () => {
    try {
      setInitializing(true)
      const response = await fetch('/api/database/init', {
        method: 'POST'
      })
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        // Only show toast if there were missing collections that needed to be created
        if (missingCollections.length > 0) {
          toast.success('Database initialized successfully!')
        }
        await fetchDatabaseStatus()
      } else {
        toast.error(data.message || 'Failed to initialize database')
      }
    } catch (error) {
      console.error('Error initializing database:', error)
      toast.error('Failed to initialize database')
    } finally {
      setInitializing(false)
    }
  }

  useEffect(() => {
    fetchDatabaseStatus()
  }, [])

  const expectedCollections = [
    'users',
    'properties', 
    'bookings',
    'reviews',
    'payments',
    'notifications',
    'messages',
    'maintenanceRequests'
  ]

  const missingCollections = expectedCollections.filter(
    col => !status?.collections.includes(col)
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor your hostel management database
          </p>
        </div>
        <Button 
          onClick={fetchDatabaseStatus} 
          variant="outline" 
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Database Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection
          </CardTitle>
          <CardDescription>
            Current status of your MongoDB connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking connection...</span>
            </div>
          ) : status ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {status.connected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {status.connected ? 'Connected' : 'Disconnected'}
                </span>
                <Badge variant={status.connected ? 'default' : 'destructive'}>
                  {status.name}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Total Collections</p>
                  <p className="text-2xl font-bold">{status.totalCollections}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Missing Collections</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {missingCollections.length}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-500">
              <XCircle className="h-5 w-5" />
              <span>Failed to fetch database status</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collections Status */}
      <Card>
        <CardHeader>
          <CardTitle>Collections Status</CardTitle>
          <CardDescription>
            Overview of all database collections and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading collections...</span>
            </div>
          ) : status ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {expectedCollections.map((collection) => {
                  const exists = status.collections.includes(collection)
                  const indexCount = status.indexes[collection]?.length || 0
                  
                  return (
                    <div
                      key={collection}
                      className={`p-3 rounded-lg border ${
                        exists 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{collection}</span>
                        {exists ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {exists && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {indexCount} indexes
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {missingCollections.length > 0 && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">
                    Missing Collections
                  </h4>
                  <p className="text-sm text-orange-700 mb-3">
                    The following collections are missing and need to be created:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {missingCollections.map((collection) => (
                      <Badge key={collection} variant="outline" className="text-orange-700">
                        {collection}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No collection data available</p>
          )}
        </CardContent>
      </Card>

      {/* Database Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Database Actions</CardTitle>
          <CardDescription>
            Initialize or reinitialize your database collections and schemas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">
                Initialize Database
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                This will create all missing collections with proper schemas, indexes, 
                and initialize the default admin user. Existing data will not be affected.
              </p>
              <Button 
                onClick={initializeDatabase}
                disabled={initializing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {initializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Initialize Database
                  </>
                )}
              </Button>
            </div>
            
            {status?.connected && missingCollections.length === 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium text-green-800">
                    Database is properly initialized
                  </h4>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  All required collections and indexes are in place.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}