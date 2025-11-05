import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Conversation } from '@/lib/models'

// GET /api/chat/conversations/unread
// Returns unread message counts for all conversations of the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const db = await getDatabase()
    const conversationsCollection = db.collection<Conversation>('conversations')
    let userObjectId: ObjectId
    if (ObjectId.isValid(session.user.id)) {
      userObjectId = new ObjectId(session.user.id)
    } else {
      const usersCollection = db.collection('users')
      const user = await usersCollection.findOne({ email: session.user.email })
      if (!user) {
        return NextResponse.json({ unread: [] })
      }
      userObjectId = user._id
    }
    const conversations = await conversationsCollection
      .find({ 'participants.userId': userObjectId })
      .project({ _id: 1, unreadCounts: 1 })
      .toArray()
    const unread = conversations.map(conv => ({
      conversationId: conv._id.toString(),
      unreadCount: conv.unreadCounts?.[userObjectId.toString()] || 0
    }))
    return NextResponse.json({ unread })
  } catch (error) {
    console.error('Error fetching unread counts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 