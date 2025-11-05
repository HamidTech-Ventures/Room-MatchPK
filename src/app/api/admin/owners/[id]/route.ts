import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { User, Property, Review } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { ObjectId } from 'mongodb'

function extractIdFromUrl(url: string): string | null {
  // /api/admin/owners/{id}
  const match = url.match(/\/api\/admin\/owners\/([^/]+)/)
  return match ? match[1] : null
}

// GET - Fetch individual owner details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const id = extractIdFromUrl(request.nextUrl.pathname)
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid owner ID' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')
    const propertiesCollection = db.collection<Property>('properties')
    const reviewsCollection = db.collection<Review>('reviews')
    
    // Get owner details
    const owner = await usersCollection.findOne({ 
      _id: new ObjectId(id),
      role: 'owner'
    })

    if (!owner) {
      return NextResponse.json(
        { success: false, error: 'Owner not found' },
        { status: 404 }
      )
    }

    // Get owner's properties - check both ObjectId and string formats
    const properties = await propertiesCollection
      .find({ 
        $or: [
          { ownerId: new ObjectId(id) },
          { ownerId: id }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Calculate statistics
    const totalProperties = properties.length
    const approvedProperties = properties.filter(p => p.isVerified).length
    const pendingProperties = properties.filter(p => !p.isVerified).length
    const totalRooms = properties.reduce((sum, p) => sum + (p.totalRooms || 0), 0)
    const availableRooms = properties.reduce((sum, p) => sum + (p.availableRooms || 0), 0)

    // Calculate total property cost (sum of all property monthly rents)
    const totalPropertyCost = properties.reduce((sum, property) => {
      return sum + (property.pricing?.pricePerBed || 0)
    }, 0)

    // Calculate owner rating based on all reviews for their properties
    const propertyIds = properties.map(p => p._id)
    let ownerRating = 0
    let totalReviews = 0
    
    console.log(`Owner ${owner.name} (${id}):`, {
      totalProperties: properties.length,
      propertyIds: propertyIds.map(id => id?.toString())
    })
    
    if (propertyIds.length > 0) {
      const reviews = await reviewsCollection
        .find({ 
          propertyId: { $in: propertyIds }
          // Remove isVerified filter to include all reviews
        })
        .toArray()
      
      console.log(`Found ${reviews.length} reviews for owner ${owner.name}:`, 
        reviews.map(r => ({ propertyId: r.propertyId?.toString(), rating: r.rating }))
      )
      
      totalReviews = reviews.length
      if (totalReviews > 0) {
        const totalRatingSum = reviews.reduce((sum, review) => sum + (review.rating || 0), 0)
        ownerRating = totalRatingSum / totalReviews
      }
    }

    // Serialize data
    const serializedOwner = {
      ...owner,
      _id: owner._id?.toString(),
      createdAt: owner.createdAt?.toISOString()
    }

    const serializedProperties = properties.map(property => ({
      ...property,
      _id: property._id?.toString(),
      ownerId: property.ownerId?.toString(),
      createdAt: property.createdAt?.toISOString()
    }))

    const ownerWithStats = {
      ...serializedOwner,
      totalProperties,
      approvedProperties,
      pendingProperties,
      totalRooms,
      availableRooms,
      properties: serializedProperties,
      totalPropertyCost,
      rating: Math.round(ownerRating * 10) / 10, // Calculated from actual reviews, rounded to 1 decimal
      totalReviews, // Number of reviews
      status: 'verified' // This would need to be determined based on verification status
    }

    return NextResponse.json({
      success: true,
      owner: ownerWithStats
    })
  } catch (error) {
    console.error('Error fetching owner details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch owner details' },
      { status: 500 }
    )
  }
} 