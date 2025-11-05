import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

// GET - Fetch recent students for admin dashboard
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
    const studentsCollection = db.collection<User>('users')
    
    // Get recent students (last 5)
    const recentStudents = await studentsCollection
      .find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    // Convert ObjectId to string for JSON serialization
    const serializedStudents = recentStudents.map(student => ({
      ...student,
      _id: student._id?.toString(),
      createdAt: student.createdAt?.toISOString()
    }))

    return NextResponse.json({
      success: true,
      students: serializedStudents
    })
  } catch (error) {
    console.error('Error fetching recent students:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent students' },
      { status: 500 }
    )
  }
} 