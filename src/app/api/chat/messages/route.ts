import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Message, Conversation } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if database is configured
    if (!require('@/lib/mongodb').isDatabaseConfigured()) {
      // Return empty messages for mock conversations
      return NextResponse.json({ messages: [] })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    // Validate conversation ID format
    if (!ObjectId.isValid(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversation ID format' }, { status: 400 })
    }

    const db = await getDatabase()
    const messagesCollection = db.collection<Message>('messages')
    const conversationsCollection = db.collection<Conversation>('conversations')

    // Get current user ObjectId
    const usersCollection = db.collection('users')
    const user = await usersCollection.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }
    const currentUserObjectId = user._id

    // Verify user is participant in conversation
    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(conversationId),
      'participants.userId': currentUserObjectId
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 })
    }

    // Get messages with pagination
    const skip = (page - 1) * limit
    const messages = await messagesCollection
      .find({ 
        conversationId: new ObjectId(conversationId),
        isDeleted: { $ne: true }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Reverse to show oldest first
    messages.reverse()

    // Serialize ObjectIds for JSON response
    const serializedMessages = messages.map(msg => ({
      ...msg,
      _id: msg._id.toString(),
      conversationId: msg.conversationId.toString(),
      senderId: msg.senderId.toString(),
      readBy: msg.readBy?.map(r => ({
        ...r,
        userId: r.userId.toString()
      })) || []
    }))

    return NextResponse.json({ messages: serializedMessages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if database is configured
    if (!require('@/lib/mongodb').isDatabaseConfigured()) {
      const { conversationId, text } = await request.json()
      
      // Create a mock message for testing without database
      const mockMessage = {
        _id: `mock-msg-${Date.now()}`,
        conversationId: conversationId,
        senderId: 'current-user',
        senderRole: 'student',
        text: text,
        messageType: 'text',
        attachments: [],
        readBy: [{
          userId: 'current-user',
          readAt: new Date()
        }],
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      return NextResponse.json({ message: mockMessage })
    }

    const { conversationId, text, messageType = 'text', attachments = [] } = await request.json()
    console.log('Sending message:', { conversationId, text, senderId: session.user.id })

    if (!conversationId || !text?.trim()) {
      return NextResponse.json({ error: 'Conversation ID and message text are required' }, { status: 400 })
    }

    // Validate conversation ID format
    if (!ObjectId.isValid(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversation ID format' }, { status: 400 })
    }

    const db = await getDatabase()
    const messagesCollection = db.collection<Message>('messages')
    const conversationsCollection = db.collection<Conversation>('conversations')

    // Get current user ObjectId
    const usersCollection = db.collection('users')
    const currentUser = await usersCollection.findOne({ email: session.user.email })
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }
    const currentUserObjectId = currentUser._id

    // Verify user is participant in conversation
    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(conversationId),
      'participants.userId': currentUserObjectId
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 })
    }

    // Create new message
    const newMessage: Message = {
      conversationId: new ObjectId(conversationId),
      senderId: currentUserObjectId,
      senderRole: (currentUser?.role || session.user.role) as 'student' | 'owner' | 'admin',
      text: text.trim(),
      messageType,
      attachments,
      readBy: [{
        userId: currentUserObjectId,
        readAt: new Date()
      }],
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await messagesCollection.insertOne(newMessage)

    // Update conversation with last message and unread counts
    const updateData: any = {
      lastMessage: {
        text: text.trim(),
        senderId: currentUserObjectId,
        timestamp: new Date()
      },
      updatedAt: new Date()
    }

    // Update unread counts for other participants
    const unreadCounts: any = { ...conversation.unreadCounts }
    conversation.participants.forEach(participant => {
      if (participant.userId.toString() !== currentUserObjectId.toString()) {
        unreadCounts[participant.userId.toString()] = (unreadCounts[participant.userId.toString()] || 0) + 1
      }
    })
    updateData.unreadCounts = unreadCounts

    await conversationsCollection.updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: updateData }
    )

    const message = await messagesCollection.findOne({ _id: result.insertedId })
    
    if (!message) {
      return NextResponse.json({ error: 'Failed to retrieve sent message' }, { status: 500 })
    }

    // Serialize ObjectIds for JSON response
    const serializedMessage = {
      ...message,
      _id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId.toString(),
      readBy: message.readBy?.map(r => ({
        ...r,
        userId: r.userId.toString()
      })) || []
    }

    return NextResponse.json({ message: serializedMessage })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}