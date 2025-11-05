import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Review, Property } from '@/lib/models'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

function getPropertyIdFromQuery(request: NextRequest): string | null {
  const { searchParams } = new URL(request.url)
  const propertyId = searchParams.get('propertyId')
  console.log('Property ID from query:', propertyId)
  return propertyId
}

// GET - Fetch all reviews for a property
export async function GET(request: NextRequest) {
  try {
    const id = getPropertyIdFromQuery(request)
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID. Please include propertyId in query parameters.' },
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
    const id = getPropertyIdFromQuery(request)
    console.log('Review submission - Property ID:', id)
    
    if (!id || !ObjectId.isValid(id)) {
      console.log('Invalid property ID:', id)
      return NextResponse.json(
        { success: false, error: 'Invalid property ID. Please include propertyId in query parameters.' },
        { status: 400 }
      )
    }
    
    // Extract and verify Bearer token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid Authorization header')
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    let decodedToken: any
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret')
      console.log('Decoded token:', decodedToken)
    } catch (error) {
      console.log('Invalid token:', error)
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Check if user is a student
    if (!decodedToken || decodedToken.role !== 'student') {
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
    
    // Get user ObjectId from database using email
    const db = await getDatabase()
    const usersCollection = db.collection('users')
    const userDoc = await usersCollection.findOne({ email: decodedToken.email })
    
    if (!userDoc || !userDoc._id) {
      console.log('User not found in database:', decodedToken.email)
      return NextResponse.json(
        { success: false, error: 'Invalid user - user not found in database' },
        { status: 400 }
      )
    }
    
    const userObjectId = userDoc._id
    console.log('Using user ObjectId:', userObjectId)
    
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