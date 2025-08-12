import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Booking, Property } from '@/lib/models'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

function extractIdFromUrl(url: string): string | null {
  // /api/properties/{id}/bookings
  const match = url.match(/\/api\/properties\/([^/]+)\/bookings/)
  return match ? match[1] : null
}

// GET - Fetch all bookings for a property (owner or admin only)
export async function GET(request: NextRequest) {
  try {
    const id = extractIdFromUrl(request.nextUrl.pathname)
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID' },
        { status: 400 }
      )
    }
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'owner' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Only property owners or admin can view bookings' },
        { status: 403 }
      )
    }
    const db = await getDatabase()
    const collection = db.collection<Booking>('bookings')
    const bookings = await collection.find({ propertyId: new ObjectId(id) }).sort({ createdAt: -1 }).toArray()
    // Convert ObjectId to string for JSON serialization
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      _id: booking._id?.toString(),
      propertyId: booking.propertyId?.toString(),
      studentId: booking.studentId?.toString(),
      ownerId: booking.ownerId?.toString()
    }))
    return NextResponse.json({ success: true, bookings: serializedBookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST - Create a new booking for a property (student only)
export async function POST(request: NextRequest) {
  try {
    const id = extractIdFromUrl(request.nextUrl.pathname)
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID' },
        { status: 400 }
      )
    }
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json(
        { success: false, error: 'Only students can book properties' },
        { status: 403 }
      )
    }
    const body = await request.json()
    if (!body.checkInDate || !body.duration || typeof body.duration !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Check-in date and duration are required' },
        { status: 400 }
      )
    }
    const db = await getDatabase()
    const bookingsCollection = db.collection<Booking>('bookings')
    const propertiesCollection = db.collection<Property>('properties')
    // Check property exists and is active
    const property = await propertiesCollection.findOne({ _id: new ObjectId(id), isActive: true })
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found or inactive' },
        { status: 404 }
      )
    }
    // Check if rooms are available
    if (!property.availableRooms || property.availableRooms < 1) {
      return NextResponse.json(
        { success: false, error: 'No rooms available' },
        { status: 400 }
      )
    }
    // Create booking
    const bookingDoc: Booking = {
      propertyId: new ObjectId(id),
      studentId: new ObjectId(session.user.id),
      ownerId: property.ownerId,
      checkInDate: new Date(body.checkInDate),
      duration: body.duration,
      totalAmount: property.pricing.pricePerBed * body.duration,
      securityDeposit: property.pricing.securityDeposit || 0,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const result = await bookingsCollection.insertOne(bookingDoc)
    // Decrement availableRooms
    await propertiesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { availableRooms: -1 } }
    )
    return NextResponse.json({ success: true, bookingId: result.insertedId.toString() })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    )
  }
} 