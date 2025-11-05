import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Review, Property, User } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// GET - Fetch review statistics for admin dashboard
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
    const reviewsCollection = db.collection<Review>('reviews')
    const propertiesCollection = db.collection<Property>('properties')
    const usersCollection = db.collection<User>('users')

    // Get total reviews
    const totalReviews = await reviewsCollection.countDocuments()

    // Get average rating
    const reviews = await reviewsCollection.find({}).toArray()
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length 
      : 0

    // Get recent reviews (last 10)
    const recentReviews = await reviewsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    // Get review distribution by rating
    const ratingDistribution = await reviewsCollection.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray()

    // Get properties with most reviews
    const topReviewedProperties = await reviewsCollection.aggregate([
      {
        $group: {
          _id: '$propertyId',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { reviewCount: -1 }
      },
      {
        $limit: 5
      }
    ]).toArray()

    // Get property details for top reviewed properties
    const propertyIds = topReviewedProperties.map(p => p._id)
    const properties = await propertiesCollection
      .find({ _id: { $in: propertyIds } })
      .toArray()

    const topPropertiesWithDetails = topReviewedProperties.map(property => {
      const propertyDetails = properties.find(p => p._id.toString() === property._id.toString())
      return {
        ...property,
        _id: property._id.toString(),
        propertyTitle: propertyDetails?.title || 'Unknown Property',
        propertyLocation: propertyDetails?.address ? 
          `${propertyDetails.address.area || ''}, ${propertyDetails.address.city || ''}` : 
          'Unknown Location'
      }
    })

    // Serialize recent reviews with user and property details
    const serializedRecentReviews = await Promise.all(
      recentReviews.map(async (review) => {
        const [student, property] = await Promise.all([
          usersCollection.findOne({ _id: review.studentId }),
          propertiesCollection.findOne({ _id: review.propertyId })
        ])

        return {
          ...review,
          _id: review._id?.toString(),
          propertyId: review.propertyId?.toString(),
          studentId: review.studentId?.toString(),
          studentName: student?.name || 'Unknown Student',
          propertyTitle: property?.title || 'Unknown Property',
          createdAt: review.createdAt?.toISOString()
        }
      })
    )

    return NextResponse.json({
      success: true,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        ratingDistribution: ratingDistribution.map(r => ({
          rating: r._id,
          count: r.count
        })),
        topReviewedProperties: topPropertiesWithDetails,
        recentReviews: serializedRecentReviews
      }
    })
  } catch (error) {
    console.error('Error fetching review statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review statistics' },
      { status: 500 }
    )
  }
} 