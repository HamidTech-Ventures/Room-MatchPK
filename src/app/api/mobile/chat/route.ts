import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, isDatabaseConfigured } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

// Environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'

// Middleware to verify Bearer token
async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; name?: string }
    return decoded
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, ...data } = await request.json()

    // Handle different chat actions
    switch (action) {
      case 'create_conversation':
        return await createConversation(user, data)
      case 'send_message':
        return await sendMessage(user, data)
      case 'get_conversations':
        return await getConversations(user)
      case 'get_messages':
        return await getMessages(user, data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Simple chat error:', error)
    return NextResponse.json({ 
      error: 'Chat service error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function createConversation(user: { email: string; name?: string }, data: any) {
  const { participantEmail, participantName } = data

  if (!participantEmail) {
    return NextResponse.json({ error: 'Participant email required' }, { status: 400 })
  }

  // Check if database is configured
  if (!isDatabaseConfigured()) {
    const mockConversation = {
      id: `conv_${Date.now()}`,
      participants: [user.email, participantEmail],
      participantNames: [user.name || 'You', participantName || 'User'],
      createdAt: new Date().toISOString(),
      lastMessage: null
    }
    return NextResponse.json({ success: true, conversation: mockConversation })
  }

  try {
    const db = await getDatabase()
    const chatsCollection = db.collection('simple_chats')

    // Check if conversation already exists
    const existingChat = await chatsCollection.findOne({
      participants: { $all: [user.email, participantEmail] }
    })

    if (existingChat) {
      return NextResponse.json({ 
        success: true, 
        conversation: {
          id: existingChat._id.toString(),
          participants: existingChat.participants,
          participantNames: existingChat.participantNames,
          createdAt: existingChat.createdAt,
          lastMessage: existingChat.lastMessage || null
        }
      })
    }

    // Create new conversation with simple structure
    const newChat = {
      participants: [user.email, participantEmail],
      participantNames: [user.name || 'You', participantName || 'User'],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessage: null
    }

    const result = await chatsCollection.insertOne(newChat)
    
    return NextResponse.json({ 
      success: true, 
      conversation: {
        id: result.insertedId.toString(),
        participants: newChat.participants,
        participantNames: newChat.participantNames,
        createdAt: newChat.createdAt,
        lastMessage: null
      }
    })
  } catch (error) {
    console.error('Database error in createConversation:', error)
    const mockConversation = {
      id: `conv_${Date.now()}`,
      participants: [user.email, participantEmail],
      participantNames: [user.name || 'You', participantName || 'User'],
      createdAt: new Date().toISOString(),
      lastMessage: null
    }
    return NextResponse.json({ success: true, conversation: mockConversation })
  }
}

async function sendMessage(user: { email: string; name?: string }, data: any) {
  const { conversationId, text } = data

  if (!conversationId || !text?.trim()) {
    return NextResponse.json({ error: 'Conversation ID and text required' }, { status: 400 })
  }

  if (!isDatabaseConfigured()) {
    const mockMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      sender: user.email,
      senderName: user.name || 'You',
      text: text.trim(),
      createdAt: new Date().toISOString()
    }
    return NextResponse.json({ success: true, message: mockMessage })
  }

  try {
    const db = await getDatabase()
    const messagesCollection = db.collection('simple_messages')
    const chatsCollection = db.collection('simple_chats')

    const newMessage = {
      conversationId: new ObjectId(conversationId),
      sender: user.email,
      senderName: user.name || 'You',
      text: text.trim(),
      createdAt: new Date()
    }

    const result = await messagesCollection.insertOne(newMessage)

    await chatsCollection.updateOne(
      { _id: new ObjectId(conversationId) },
      { 
        $set: { 
          lastMessage: text.trim(),
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ 
      success: true, 
      message: {
        id: result.insertedId.toString(),
        conversationId,
        sender: newMessage.sender,
        senderName: newMessage.senderName,
        text: newMessage.text,
        createdAt: newMessage.createdAt
      }
    })
  } catch (error) {
    console.error('Database error in sendMessage:', error)
    const mockMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      sender: user.email,
      senderName: user.name || 'You',
      text: text.trim(),
      createdAt: new Date().toISOString()
    }
    return NextResponse.json({ success: true, message: mockMessage })
  }
}

async function getConversations(user: { email: string; name?: string }) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: true, conversations: [] })
  }

  try {
    const db = await getDatabase()
    const chatsCollection = db.collection('simple_chats')
    const usersCollection = db.collection('users')

    const currentUser = await usersCollection.findOne({ email: user.email })
    const isAdmin = currentUser?.role === 'admin'

    let conversations
    if (isAdmin) {
      conversations = await chatsCollection
        .find({})
        .sort({ updatedAt: -1 })
        .toArray()
    } else {
      conversations = await chatsCollection
        .find({ participants: user.email })
        .sort({ updatedAt: -1 })
        .toArray()
    }

    const participantEmails = [...new Set(conversations.flatMap(conv => conv.participants))]
    const participantUsers = await usersCollection.find(
      { email: { $in: participantEmails } },
      { projection: { email: 1, role: 1 } }
    ).toArray()
    
    const roleMap = new Map()
    participantUsers.forEach(user => {
      roleMap.set(user.email, user.role || 'student')
    })

    const transformedConversations = conversations.map(conv => {
      let otherParticipant: string, otherParticipantName: string, otherParticipantRole: string
      
      if (isAdmin) {
        const adminEmails = ['admin@roommatch.pk', 'admin@roommatchpk.com']
        const nonAdminParticipant = conv.participants.find((p: string) => !adminEmails.includes(p))
        otherParticipant = nonAdminParticipant || conv.participants[0]
        const participantIndex = conv.participants.findIndex((p: string) => p === otherParticipant)
        otherParticipantName = conv.participantNames[participantIndex] || 'User'
        otherParticipantRole = roleMap.get(otherParticipant) || 'student'
      } else {
        otherParticipant = conv.participants.find((p: string) => p !== user.email)
        const participantIndex = conv.participants.findIndex((p: string) => p !== user.email)
        otherParticipantName = conv.participantNames[participantIndex] || 'User'
        otherParticipantRole = roleMap.get(otherParticipant) || 'student'
      }

      return {
        id: conv._id.toString(),
        participants: conv.participants,
        participantNames: conv.participantNames,
        createdAt: conv.createdAt,
        lastMessage: conv.lastMessage,
        otherParticipant: otherParticipant,
        otherParticipantName: otherParticipantName,
        otherParticipantRole: otherParticipantRole
      }
    })

    return NextResponse.json({ success: true, conversations: transformedConversations })
  } catch (error) {
    console.error('Database error in getConversations:', error)
    return NextResponse.json({ success: true, conversations: [] })
  }
}

async function getMessages(user: { email: string; name?: string }, data: any) {
  const { conversationId } = data

  if (!conversationId) {
    return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: true, messages: [] })
  }

  try {
    const db = await getDatabase()
    const messagesCollection = db.collection('simple_messages')

    const messages = await messagesCollection
      .find({ conversationId: new ObjectId(conversationId) })
      .sort({ createdAt: 1 })
      .toArray()

    const transformedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      conversationId: msg.conversationId.toString(),
      sender: msg.sender,
      senderName: msg.senderName,
      text: msg.text,
      createdAt: msg.createdAt,
      isOwnMessage: msg.sender === user.email
    }))

    return NextResponse.json({ success: true, messages: transformedMessages })
  } catch (error) {
    console.error('Database error in getMessages:', error)
    return NextResponse.json({ success: true, messages: [] })
  }
}