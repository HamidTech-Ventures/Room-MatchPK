import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Property } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// GET - Fetch all properties for admin (no status filtering)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit
    const status = searchParams.get('status') // Optional status filter

    const db = await getDatabase()
    const collection = db.collection<Property>('properties')

    // Build filter query - admin sees all properties
    const filter: any = {}
    
    // Optional status filter
    if (status && status !== 'all') {
      filter.status = status
    }

    // Get total count for pagination
    const total = await collection.countDocuments(filter)

    // Fetch properties with pagination
    const properties = await collection
      .find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .toArray()

    // Convert ObjectId to string for JSON serialization
    const serializedProperties = properties.map(property => ({
      ...property,
      _id: property._id?.toString(),
      ownerId: property.ownerId?.toString()
    }))

    return NextResponse.json({
      success: true,
      properties: serializedProperties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching properties for admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
} 