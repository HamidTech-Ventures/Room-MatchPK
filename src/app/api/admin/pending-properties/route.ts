import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Property } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// GET - Fetch pending properties for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const db = await getDatabase()
    const propertiesCollection = db.collection<Property>('properties')
    
    // Get pending properties (status = pending)
    const pendingProperties = await propertiesCollection
      .find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    // Convert ObjectId to string for JSON serialization
    const serializedProperties = pendingProperties.map(property => ({
      ...property,
      _id: property._id?.toString(),
      ownerId: property.ownerId?.toString(),
      createdAt: property.createdAt?.toISOString()
    }))

    return NextResponse.json({
      success: true,
      properties: serializedProperties
    })
  } catch (error) {
    console.error('Error fetching pending properties:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending properties' },
      { status: 500 }
    )
  }
} 