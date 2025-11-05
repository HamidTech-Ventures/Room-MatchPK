import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Review, Property } from '@/lib/models'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getUserObjectId } from '@/lib/user-utils'

function extractIdFromUrl(url: string): string | null {
  // /api/properties/{id}/reviews
  console.log('Extracting ID from URL:', url)
  const match = url.match(/\/api\/properties\/([^/]+)\/reviews/)
  const id = match ? match[1] : null
  console.log('Extracted ID:', id)
  return id
}

// GET - Fetch all reviews for a property
export async function GET(request: NextRequest) {
  try {
    const id = extractIdFromUrl(request.nextUrl.pathname)
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID' },
        { status: 400 }
      )
    }
    const db = await getDatabase()
    const collection = db.collection<Review>('reviews')
    const usersCollection = db.collection('users')
    
    // Fetch reviews with student information
    const reviews = await collection.aggregate([
      { $match: { propertyId: new ObjectId(id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          _id: 1,
          propertyId: 1,
          studentId: 1,
          rating: 1,
          comment: 1,
          images: 1,
          isVerified: 1,
          createdAt: 1,
          updatedAt: 1,
          'student.name': 1,
          'student.email': 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray()
    
    // Convert ObjectId to string for JSON serialization
    const serializedReviews = reviews.map(review => ({
      ...review,
      _id: review._id?.toString(),
      propertyId: review.propertyId?.toString(),
      studentId: review.studentId?.toString(),
      bookingId: review.bookingId?.toString(),
      studentName: review.student?.name || 'Anonymous Student',
      studentEmail: review.student?.email || ''
    }))
    
    return NextResponse.json({ success: true, reviews: serializedReviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST - Submit a new review for a property (student only)
export async function POST(request: NextRequest) {
  try {
    const id = extractIdFromUrl(request.nextUrl.pathname)
    console.log('Review submission - Property ID:', id)
    
    if (!id || !ObjectId.isValid(id)) {
      console.log('Invalid property ID:', id)
      return NextResponse.json(
        { success: false, error: 'Invalid property ID' },
        { status: 400 }
      )
    }
    
    const session = await getServerSession(authOptions)
    console.log('Review submission - Session:', {
      user: session?.user,
      role: session?.user?.role,
      id: session?.user?.id
    })
    
    if (!session?.user || session.user.role !== 'student') {
      console.log('Unauthorized review submission attempt')
      return NextResponse.json(
        { success: false, error: 'Only students can submit reviews' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    console.log('Review submission - Body:', body)
    
    if (!body.rating || typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      console.log('Invalid rating:', body.rating)
      return NextResponse.json(
        { success: false, error: 'Rating (1-5) is required' },
        { status: 400 }
      )
    }
    
    // Get user ObjectId from session
    const userObjectId = await getUserObjectId(session)
    if (!userObjectId) {
      console.log('Could not get valid user ObjectId for:', session.user.email)
      return NextResponse.json(
        { success: false, error: 'Invalid user session - user not found in database' },
        { status: 400 }
      )
    }
    
    console.log('Using user ObjectId:', userObjectId)
    
    const db = await getDatabase()
    const reviewsCollection = db.collection<Review>('reviews')
    const propertiesCollection = db.collection<Property>('properties')
    
    // Check if property exists
    const property = await propertiesCollection.findOne({ _id: new ObjectId(id) })
    if (!property) {
      console.log('Property not found:', id)
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      )
    }
    
    // Check if user already reviewed this property
    const existingReview = await reviewsCollection.findOne({
      propertyId: new ObjectId(id),
      studentId: userObjectId
    })
    
    if (existingReview) {
      console.log('User already reviewed this property')
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this property' },
        { status: 400 }
      )
    }
    
    // Insert review
    const reviewDoc: Review = {
      propertyId: new ObjectId(id),
      studentId: userObjectId,
      rating: body.rating,
      comment: body.comment || '',
      images: body.images || [],
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    console.log('Inserting review document:', reviewDoc)
    const result = await reviewsCollection.insertOne(reviewDoc)
    console.log('Review inserted with ID:', result.insertedId)
    
    // Update property rating and totalReviews
    const allReviews = await reviewsCollection.find({ propertyId: new ObjectId(id) }).toArray()
    const totalReviews = allReviews.length
    const avgRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / (totalReviews || 1)
    
    console.log('Updating property rating:', { totalReviews, avgRating })
    await propertiesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { rating: Math.round(avgRating * 10) / 10, totalReviews } }
    )
    
    return NextResponse.json({ success: true, reviewId: result.insertedId.toString() })
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { success: false, error: `Failed to submit review: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 