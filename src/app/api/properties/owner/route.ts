import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Property } from '@/lib/models'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// GET - Fetch properties owned by the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Allow both owners and students to access their properties
    if (!['owner', 'student'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Only property owners and students can access this endpoint' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const status = searchParams.get('status') // approved, pending, rejected

    const db = await getDatabase()
    const collection = db.collection<Property>('properties')

    // Build filter query
    const filter: any = { ownerId: new ObjectId(session.user.id) }
    
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Allow both owners and students to update their properties
    if (!['owner', 'student'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Only property owners and students can update properties' },
        { status: 403 }
      )
    }

  const body = await request.json()
  const { propertyId, ...incoming } = body

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
      ownerId: new ObjectId(session.user.id)
    })

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, error: 'Property not found or access denied' },
        { status: 404 }
      )
    }

    // Build merged update similar to public PUT to avoid wiping nested pricing
    const tryParseNumber = (v: any) => {
      if (v === undefined || v === null) return undefined
      if (typeof v === 'string' && v.trim() === '') return undefined
      const n = Number(v)
      return Number.isFinite(n) ? n : undefined
    }

    const updateFields: any = {
      updatedAt: new Date(),
      status: 'pending',
      isVerified: false,
      isActive: false
    }

    const topLevelFields = ['title','description','propertyType','propertySubType','genderPreference','address','amenities','images','roomDetails','rules','contactInfo','tags','nearbyUniversity','messName','messType','monthlyCharges','monthlyRent','cnicPicFront','cnicPicBack','ownerPic','foodService','foodTimings','foodOptions','foodPricing','foodHygiene','foodStaff','foodCapacity','foodMenuRotation','foodSpecialRequirements']
    for (const f of topLevelFields) {
      if (Object.prototype.hasOwnProperty.call(incoming, f)) updateFields[f] = (incoming as any)[f]
    }

    const totalRoomsParsed = tryParseNumber(incoming.totalRooms)
    const availableRoomsParsed = tryParseNumber(incoming.availableRooms)
    if (totalRoomsParsed !== undefined) updateFields.totalRooms = totalRoomsParsed
    if (availableRoomsParsed !== undefined) updateFields.availableRooms = availableRoomsParsed

    const existingPricing = (existingProperty.pricing as any) || {}
    const incomingPricing = incoming.pricing || {}
    const mergedPricing: any = { ...existingPricing }
    const pricingNumberFields = ['pricePerBed','securityDeposit','maintenanceCharges']
    for (const k of Object.keys(incomingPricing)) {
      if (pricingNumberFields.includes(k)) {
        const parsed = tryParseNumber((incomingPricing as any)[k])
        if (parsed !== undefined) mergedPricing[k] = parsed
      } else {
        mergedPricing[k] = (incomingPricing as any)[k]
      }
    }
    const topPrice = tryParseNumber(incoming.monthlyRent ?? incoming.price ?? incoming.rent ?? incoming.monthlyCharges)
    if (topPrice !== undefined && mergedPricing.pricePerBed === undefined) mergedPricing.pricePerBed = topPrice
    if (Object.keys(mergedPricing).length > 0) updateFields.pricing = mergedPricing

    const result = await collection.updateOne(
      { _id: new ObjectId(propertyId) },
      { $set: updateFields }
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

// DELETE - Delete property
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Allow both owners and students to delete their properties
    if (!['owner', 'student'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Only property owners and students can delete properties' },
        { status: 403 }
      )
    }

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

    // Verify ownership and soft delete
    const result = await collection.updateOne(
      { 
        _id: new ObjectId(propertyId),
        ownerId: new ObjectId(session.user.id)
      },
      { 
        $set: { 
          status: 'rejected',
          isActive: false,
          isVerified: false,
          updatedAt: new Date()
        } 
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Property not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}