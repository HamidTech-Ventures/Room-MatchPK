import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Property } from '@/lib/models'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// PATCH - Admin verifies (approves/rejects) a property
export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const propertyId = id
    if (!propertyId || !ObjectId.isValid(propertyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID' },
        { status: 400 }
      )
    }
    const body = await request.json()
    if (typeof body.isVerified !== 'boolean' || typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isVerified and isActive (boolean) are required' },
        { status: 400 }
      )
    }
    const db = await getDatabase()
    const collection = db.collection<Property>('properties')
    const result = await collection.updateOne(
      { _id: new ObjectId(propertyId) },
      { $set: { isVerified: body.isVerified, isActive: body.isActive, updatedAt: new Date() } }
    )
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No changes made' },
        { status: 400 }
      )
    }
    return NextResponse.json({ success: true, message: 'Property verification status updated.' })
  } catch (error) {
    console.error('Error verifying property:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify property' },
      { status: 500 }
    )
  }
} 