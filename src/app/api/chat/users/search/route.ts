import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Simulated online status map (replace with real-time presence in production)
const onlineStatusMap: Record<string, { online: boolean, lastSeen: Date }> = {}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if database is configured
    if (!require('@/lib/mongodb').isDatabaseConfigured()) {
      const { searchParams } = new URL(request.url)
      const query = searchParams.get('query') || searchParams.get('q') || searchParams.get('email') || searchParams.get('name')
      const role = searchParams.get('role')
      
      // Return mock users for testing
      const mockUsers = []
      
      if (role === 'admin' || query?.includes('admin')) {
        mockUsers.push({
          _id: 'admin-user-id',
          name: 'Admin Support',
          email: 'admin@roommatch.pk',
          role: 'admin',
          avatar: null
        })
      }
      
      if (!role || role === 'owner') {
        mockUsers.push({
          _id: 'owner-user-id',
          name: 'Property Owner',
          email: 'owner@example.com',
          role: 'owner',
          avatar: null
        })
      }
      
      if (!role || role === 'student') {
        mockUsers.push({
          _id: 'student-user-id',
          name: 'Student User',
          email: 'student@example.com',
          role: 'student',
          avatar: null
        })
      }
      
      return NextResponse.json({ users: mockUsers })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || searchParams.get('q') || searchParams.get('email') || searchParams.get('name')
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    if (!query) {
      return NextResponse.json({ users: [] })
    }

    const db = await getDatabase()
    const usersCollection = db.collection('users')

    // Fuzzy search: use regex for typo-tolerance, search name/email/phone
    const regex = new RegExp(query.split('').join('.*'), 'i')
    const searchQuery: any = {
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } }
      ],
      isActive: { $ne: false }
    }

    // Exclude current user by email
    searchQuery.email = { $ne: session.user.email }

    // Add role filter if specified
    if (role && ['student', 'owner', 'admin'].includes(role)) {
      searchQuery.role = role
    }

    // For non-admin users, limit search based on their role
    if (session.user.role !== 'admin') {
      if (session.user.role === 'student') {
        searchQuery.role = { $in: ['owner', 'admin'] }
      } else if (session.user.role === 'owner') {
        searchQuery.role = { $in: ['student', 'admin'] }
      }
    }

    // Count total for pagination
    const total = await usersCollection.countDocuments(searchQuery)

    // Fetch users with pagination
    const users = await usersCollection
      .find(searchQuery, {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          avatar: 1,
          phone: 1
        }
      })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Add online/last-seen status (stubbed)
    const usersWithStatus = users.map(u => ({
      ...u,
      _id: u._id?.toString(),
      online: onlineStatusMap[u._id?.toString()]?.online || false,
      lastSeen: onlineStatusMap[u._id?.toString()]?.lastSeen || null
    }))

    return NextResponse.json({
      users: usersWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}