import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Message, Conversation } from '@/lib/models'

// GET /api/chat/messages/search?conversationId=...&search=...&page=...&limit=...
// Search messages by keyword in a conversation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    if (!conversationId || !search) {
      return NextResponse.json({ error: 'Conversation ID and search keyword are required' }, { status: 400 })
    }
    if (!ObjectId.isValid(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversation ID format' }, { status: 400 })
    }

    const db = await getDatabase()
    const messagesCollection = db.collection<Message>('messages')
    const conversationsCollection = db.collection<Conversation>('conversations')

    // Get current user ObjectId
    let currentUserObjectId: ObjectId
    if (ObjectId.isValid(session.user.id)) {
      currentUserObjectId = new ObjectId(session.user.id)
    } else {
      const usersCollection = db.collection('users')
      const user = await usersCollection.findOne({ email: session.user.email })
      if (!user) {
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
      }
      currentUserObjectId = user._id
    }

    // Verify user is participant in conversation
    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(conversationId),
      'participants.userId': currentUserObjectId
    })
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 })
    }

    // Search messages by keyword
    const regex = new RegExp(search, 'i')
    const messages = await messagesCollection
      .find({
        conversationId: new ObjectId(conversationId),
        text: { $regex: regex },
        isDeleted: { $ne: true }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
    messages.reverse()
    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error searching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 