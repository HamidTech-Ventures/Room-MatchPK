import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { User, Property, Booking, Review } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// GET - Fetch admin dashboard statistics
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
    
    // Get total students
    const studentsCollection = db.collection<User>('users')
    const totalStudents = await studentsCollection.countDocuments({ role: 'student' })
    
    // Get total property owners
    const totalOwners = await studentsCollection.countDocuments({ role: 'owner' })
    
    // Get total properties
    const propertiesCollection = db.collection<Property>('properties')
    const totalProperties = await propertiesCollection.countDocuments()
    
    // Get properties by status (use status field, fallback to old logic for backward compatibility)
    const approvedProperties = await propertiesCollection.countDocuments({
      $or: [
        { status: 'approved' },
        { isVerified: true, status: { $exists: false } }
      ]
    })
    const pendingProperties = await propertiesCollection.countDocuments({
      $or: [
        { status: 'pending' },
        { isVerified: false, isActive: true, status: { $exists: false } }
      ]
    })
    const rejectedProperties = await propertiesCollection.countDocuments({
      $or: [
        { status: 'rejected' },
        { isActive: false, status: { $exists: false } }
      ]
    })
    
    // Get total bookings
    const bookingsCollection = db.collection<Booking>('bookings')
    const totalBookings = await bookingsCollection.countDocuments()
    
    // Get bookings by status
    const activeBookings = await bookingsCollection.countDocuments({ status: 'active' })
    const pendingBookings = await bookingsCollection.countDocuments({ status: 'pending' })
    const completedBookings = await bookingsCollection.countDocuments({ status: 'completed' })
    
    // Get total reviews
    const reviewsCollection = db.collection<Review>('reviews')
    const totalReviews = await reviewsCollection.countDocuments()
    
    // Calculate percentage changes (mock data for now)
    const stats = {
      students: {
        total: totalStudents,
        change: "+12%", // This would need historical data to calculate
        active: totalStudents
      },
      owners: {
        total: totalOwners,
        change: "+8%", // This would need historical data to calculate
        verified: totalOwners
      },
      properties: {
        total: totalProperties,
        change: "+15%", // This would need historical data to calculate
        approved: approvedProperties,
        pending: pendingProperties,
        rejected: rejectedProperties
      },
      bookings: {
        total: totalBookings,
        change: "+20%", // This would need historical data to calculate
        active: activeBookings,
        pending: pendingBookings,
        completed: completedBookings
      },
      reviews: {
        total: totalReviews,
        change: "+5%", // This would need historical data to calculate
        average: 0 // This would need to be calculated from actual reviews
      }
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
} 