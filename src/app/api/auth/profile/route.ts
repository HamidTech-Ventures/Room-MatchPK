import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// GET - Fetch current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    const db = await getDatabase()
    const collection = db.collection<User>('users')
    const user = await collection.findOne({ _id: new ObjectId(session.user.id) })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, user: {
      ...user,
      _id: user._id?.toString()
    } })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const db = await getDatabase()
    const collection = db.collection<User>('users')
    const updateFields: Partial<User> = {}
    if (body.name) updateFields.name = body.name
    if (body.email) updateFields.email = body.email
    if (body.phone) updateFields.phone = body.phone
    if (body.avatar) updateFields.avatar = body.avatar
    // Add more fields as needed
    const result = await collection.updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { ...updateFields, updatedAt: new Date() } }
    )
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No changes made' },
        { status: 400 }
      )
    }
    return NextResponse.json({ success: true, message: 'Profile updated successfully.' })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 