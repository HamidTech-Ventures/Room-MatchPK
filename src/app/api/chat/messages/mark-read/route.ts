import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await request.json()

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversation ID format' }, { status: 400 })
    }

    const db = await getDatabase()
    const messagesCollection = db.collection('messages')
    const conversationsCollection = db.collection('conversations')

    // Get current user ObjectId
    let currentUserObjectId: ObjectId

    if (ObjectId.isValid(session.user.id)) {
      currentUserObjectId = new ObjectId(session.user.id)
    } else {
      // Find user by email if ID is not valid ObjectId
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

    // Mark all messages in conversation as read by this user
    await messagesCollection.updateMany(
      {
        conversationId: new ObjectId(conversationId),
        senderId: { $ne: currentUserObjectId },
        'readBy.userId': { $ne: currentUserObjectId }
      },
      {
        $push: {
          readBy: {
            userId: currentUserObjectId,
            readAt: new Date()
          }
        }
      } as any
    )

    // Reset unread count for this user in conversation
    const unreadCounts = { ...conversation.unreadCounts }
    unreadCounts[currentUserObjectId.toString()] = 0

    await conversationsCollection.updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: { unreadCounts } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}