import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { User, Property, Review } from '@/lib/models'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// GET - Fetch all property owners for admin dashboard
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
    const usersCollection = db.collection<User>('users')
    const propertiesCollection = db.collection<Property>('properties')
    const reviewsCollection = db.collection<Review>('reviews')
    
    // Get all property owners
    const owners = await usersCollection
      .find({ role: 'owner' })
      .sort({ createdAt: -1 })
      .toArray()

    // Get property counts for each owner
    const ownersWithStats = await Promise.all(
      owners.map(async (owner) => {
        // Convert owner._id to ObjectId for consistent comparison
        const ownerObjectId = typeof owner._id === 'string' ? new ObjectId(owner._id) : owner._id
        
        const propertyCount = await propertiesCollection.countDocuments({ 
          $or: [
            { ownerId: ownerObjectId },
            { ownerId: owner._id?.toString() }
          ]
        })
        
        const approvedProperties = await propertiesCollection.countDocuments({ 
          $or: [
            { ownerId: ownerObjectId, isVerified: true },
            { ownerId: owner._id?.toString(), isVerified: true }
          ]
        })

        // Calculate total property cost (sum of all property monthly rents)
        const ownerProperties = await propertiesCollection.find({ 
          $or: [
            { ownerId: ownerObjectId },
            { ownerId: owner._id?.toString() }
          ]
        }).toArray()
        
        const totalPropertyCost = ownerProperties.reduce((sum, property) => {
          return sum + (property.pricing?.pricePerBed || 0)
        }, 0)

        // Calculate owner rating based on all reviews for their properties
        const propertyIds = ownerProperties.map(p => p._id)
        let ownerRating = 0
        let totalReviews = 0
        
        console.log(`Owner ${owner.name} (${owner._id}):`, {
          propertyCount,
          propertyIds: propertyIds.map(id => id?.toString()),
          ownerObjectId: ownerObjectId?.toString(),
          ownerProperties: ownerProperties.length
        })
        
        // Debug: Check what ownerIds are in properties
        if (ownerProperties.length > 0) {
          console.log('Sample property ownerIds:', ownerProperties.slice(0, 2).map(p => ({
            _id: p._id?.toString(),
            ownerId: p.ownerId?.toString(),
            ownerIdType: typeof p.ownerId
          })))
        }
        
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

        return {
          ...owner,
          _id: owner._id?.toString(),
          createdAt: owner.createdAt?.toISOString(),
          propertyCount,
          approvedProperties,
          totalPropertyCost,
          rating: Math.round(ownerRating * 10) / 10, // Round to 1 decimal place
          totalReviews
        }
      })
    )

    return NextResponse.json({
      success: true,
      owners: ownersWithStats
    })
  } catch (error) {
    console.error('Error fetching owners:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch owners' },
      { status: 500 }
    )
  }
} 