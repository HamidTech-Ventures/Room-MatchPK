import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getDatabase, isDatabaseConfigured } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Simple chat implementation that avoids MongoDB validation issues
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, ...data } = await request.json()

    // Handle different chat actions
    switch (action) {
      case 'create_conversation':
        return await createConversation(session, data)
      case 'send_message':
        return await sendMessage(session, data)
      case 'get_conversations':
        return await getConversations(session)
      case 'get_messages':
        return await getMessages(session, data)
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

async function createConversation(session: any, data: any) {
  const { participantEmail, participantName } = data

  if (!participantEmail) {
    return NextResponse.json({ error: 'Participant email required' }, { status: 400 })
  }

  // Check if database is configured
  if (!isDatabaseConfigured()) {
    // Return mock conversation
    const mockConversation = {
      id: `conv_${Date.now()}`,
      participants: [session.user.email, participantEmail],
      participantNames: [session.user.name || 'You', participantName || 'User'],
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
      participants: { $all: [session.user.email, participantEmail] }
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
      participants: [session.user.email, participantEmail],
      participantNames: [session.user.name || 'You', participantName || 'User'],
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
    // Fallback to mock
    const mockConversation = {
      id: `conv_${Date.now()}`,
      participants: [session.user.email, participantEmail],
      participantNames: [session.user.name || 'You', participantName || 'User'],
      createdAt: new Date().toISOString(),
      lastMessage: null
    }
    return NextResponse.json({ success: true, conversation: mockConversation })
  }
}

async function sendMessage(session: any, data: any) {
  const { conversationId, text } = data

  if (!conversationId || !text?.trim()) {
    return NextResponse.json({ error: 'Conversation ID and text required' }, { status: 400 })
  }

  // Check if database is configured
  if (!isDatabaseConfigured()) {
    // Return mock message
    const mockMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      sender: session.user.email,
      senderName: session.user.name || 'You',
      text: text.trim(),
      createdAt: new Date().toISOString()
    }
    return NextResponse.json({ success: true, message: mockMessage })
  }

  try {
    const db = await getDatabase()
    const messagesCollection = db.collection('simple_messages')
    const chatsCollection = db.collection('simple_chats')

    // Create message
    const newMessage = {
      conversationId: new ObjectId(conversationId),
      sender: session.user.email,
      senderName: session.user.name || 'You',
      text: text.trim(),
      createdAt: new Date()
    }

    const result = await messagesCollection.insertOne(newMessage)

    // Update conversation last message
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
    // Fallback to mock
    const mockMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      sender: session.user.email,
      senderName: session.user.name || 'You',
      text: text.trim(),
      createdAt: new Date().toISOString()
    }
    return NextResponse.json({ success: true, message: mockMessage })
  }
}

async function getConversations(session: any) {
  // Check if database is configured
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: true, conversations: [] })
  }

  try {
    const db = await getDatabase()
    const chatsCollection = db.collection('simple_chats')
    const usersCollection = db.collection('users')

    // Find current user to check if admin
    const currentUser = await usersCollection.findOne({ email: session.user.email })
    const isAdmin = currentUser?.role === 'admin'

    let conversations
    if (isAdmin) {
      // Admin sees ALL conversations
      conversations = await chatsCollection
        .find({})
        .sort({ updatedAt: -1 })
        .toArray()
    } else {
      // Regular users see only their conversations
      conversations = await chatsCollection
        .find({ participants: session.user.email })
        .sort({ updatedAt: -1 })
        .toArray()
    }

    // Fetch participant roles from users collection
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
        // For admin, show the non-admin participant
        const adminEmails = ['admin@roommatch.pk', 'admin@roommatchpk.com']
        const nonAdminParticipant = conv.participants.find((p: string) => !adminEmails.includes(p))
        otherParticipant = nonAdminParticipant || conv.participants[0]
        const participantIndex = conv.participants.findIndex((p: string) => p === otherParticipant)
        otherParticipantName = conv.participantNames[participantIndex] || 'User'
        otherParticipantRole = roleMap.get(otherParticipant) || 'student'
      } else {
        // For regular users, show the other participant
        otherParticipant = conv.participants.find((p: string) => p !== session.user.email)
        const participantIndex = conv.participants.findIndex((p: string) => p !== session.user.email)
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

async function getMessages(session: any, data: any) {
  const { conversationId } = data

  if (!conversationId) {
    return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
  }

  // Check if database is configured
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

    // Check if current user is admin
    const usersCollection = db.collection('users')
    const currentUser = await usersCollection.findOne({ email: session.user.email })
    
    const transformedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      conversationId: msg.conversationId.toString(),
      sender: msg.sender,
      senderName: msg.senderName,
      text: msg.text,
      createdAt: msg.createdAt,
      isOwnMessage: msg.sender === session.user.email
    }))

    return NextResponse.json({ success: true, messages: transformedMessages })
  } catch (error) {
    console.error('Database error in getMessages:', error)
    return NextResponse.json({ success: true, messages: [] })
  }
}
