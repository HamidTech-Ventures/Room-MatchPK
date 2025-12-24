import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Property } from '@/lib/models'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your_jwt_secret'

// Helper function to verify JWT token
async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string }
    return decoded
  } catch (error) {
    return null
  }
}

// GET - Fetch properties owned by the current user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Allow any authenticated user to access their properties
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const status = searchParams.get('status') // approved, pending, rejected

    const db = await getDatabase()
    const collection = db.collection<Property>('properties')

    // Build filter query
    const filter: any = { ownerId: new ObjectId(user.id) }
    
    if (status) {
      // Use the status field directly if it exists, otherwise fall back to the old logic
      filter.$or = [
        { status: status },
        // Fallback for properties without status field (backward compatibility)
        ...(status === 'approved' ? [{ isVerified: true, isActive: true, status: { $exists: false } }] :
           status === 'pending' ? [{ isVerified: false, status: { $exists: false } }] :
           status === 'rejected' ? [{ isActive: false, status: { $exists: false } }] : [])
      ]
    }

    // Get total count for pagination
    const total = await collection.countDocuments(filter)

    // Fetch properties with pagination
    const properties = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Calculate additional stats for each property
    const propertiesWithStats = await Promise.all(
      properties.map(async (property) => {
        // Calculate occupancy rate
        const occupancyRate = property.totalRooms && property.totalRooms > 0 
          ? ((property.totalRooms - (property.availableRooms || 0)) / property.totalRooms) * 100 
          : 0

        // Calculate monthly revenue (this would be more complex in real app)
        const monthlyRevenue = property.totalRooms && property.pricing?.pricePerBed
          ? (property.totalRooms - (property.availableRooms || 0)) * property.pricing.pricePerBed
          : 0

        return {
          ...property,
          _id: property._id?.toString(),
          ownerId: property.ownerId?.toString(),
          occupancyRate: Math.round(occupancyRate),
          monthlyRevenue,
          // Use the actual status field from database, fallback to derived status for backward compatibility
          status: property.status || (property.isVerified ? 'approved' : 'pending')
        }
      })
    )

    return NextResponse.json({
      success: true,
      properties: propertiesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching owner properties:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

// PUT - Update property
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Allow any authenticated user to update their properties
    const body = await request.json()
    const { propertyId, ...updateData } = body

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const collection = db.collection<Property>('properties')

    // Verify ownership
    const existingProperty = await collection.findOne({
      _id: new ObjectId(propertyId),
      ownerId: new ObjectId(user.id)
    })

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, error: 'Property not found or access denied' },
        { status: 404 }
      )
    }

    // Update property
    const result = await collection.updateOne(
      { _id: new ObjectId(propertyId) },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date(),
          // Reset verification and status when property is updated
          status: 'pending',
          isVerified: false,
          isActive: false
        } 
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No changes made' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully. It will be reviewed again by admin.'
    })

  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update property' },
      { status: 500 }
    )
  }
}

// Delete the Property
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Allow any authenticated user to delete their properties
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const collection = db.collection<Property>('properties')

    // ❌ Soft delete → ✅ Hard delete (remove from DB)
    const result = await collection.deleteOne({
      _id: new ObjectId(propertyId),
      ownerId: new ObjectId(user.id)  // only allow owner to delete their own property
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Property not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Property deleted permanently'
    })

  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}
