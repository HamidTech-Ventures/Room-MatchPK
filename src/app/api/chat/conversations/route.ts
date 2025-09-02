import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getDatabase, isDatabaseConfigured } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Conversation, LegacyConversation, ConversationDocument } from '@/lib/models'

// Type guard to check if conversation is in legacy format
function isLegacyConversation(conv: ConversationDocument): conv is LegacyConversation {
  return 'user1' in conv && 'user2' in conv
}

export async function GET(request: NextRequest) {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured()) {
      console.log('Database not configured, returning empty conversations')
      return NextResponse.json({ 
        conversations: [] 
      })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const conversationsCollection = db.collection<ConversationDocument>('conversations')
    const usersCollection = db.collection('users')

    // Find user by email to get ObjectId
    const user = await usersCollection.findOne({ email: session.user.email })
    
    if (!user) {
      // Return empty conversations for users not in database yet
      return NextResponse.json({ conversations: [] })
    }
    
    const userObjectId = user._id

    // Get all conversations where the user is a participant (try both formats)
    const conversations = await conversationsCollection
      .find({
        'participants.userId': userObjectId
      })
      .sort({ updatedAt: -1 })
      .toArray()
    
    // Also get conversations in simple format
    const simpleConversations = await conversationsCollection
      .find({
        $or: [
          { user1: userObjectId },
          { user2: userObjectId }
        ]
      })
      .sort({ updatedAt: -1 })
      .toArray()
    
    // Transform simple conversations to complex format
    const legacyConversations = simpleConversations.filter(isLegacyConversation) as LegacyConversation[]
    const transformedSimpleConversations = legacyConversations
      .filter(conv => conv._id) // Only include conversations with valid _id
      .map(conv => ({
        _id: conv._id!,
        participants: [
          {
            userId: conv.user1,
            role: conv.user1Role,
            name: conv.user1Name,
            email: conv.user1Email
          },
          {
            userId: conv.user2,
            role: conv.user2Role,
            name: conv.user2Name,
            email: conv.user2Email
          }
        ],
        unreadCounts: {},
        isActive: conv.active,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      }))
    
    // Combine both types
    const allConversations = [...conversations, ...transformedSimpleConversations]
    
    // Remove duplicates and sort
    const uniqueConversations = allConversations.filter((conv, index, self) => 
      index === self.findIndex(c => c._id?.toString() === conv._id?.toString())
    ).sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return dateB - dateA
    })

    // Transform conversations to include unread count for current user
    const transformedConversations = uniqueConversations.map(conv => {
      // Ensure we have a conversation in the correct format
      let normalizedConv: Conversation
      
      if (isLegacyConversation(conv)) {
        // Transform legacy conversation to new format
        const legacyConv = conv as LegacyConversation
        normalizedConv = {
          _id: legacyConv._id!,
          participants: [
            {
              userId: legacyConv.user1,
              role: legacyConv.user1Role,
              name: legacyConv.user1Name,
              email: legacyConv.user1Email
            },
            {
              userId: legacyConv.user2,
              role: legacyConv.user2Role,
              name: legacyConv.user2Name,
              email: legacyConv.user2Email
            }
          ],
          unreadCounts: {},
          isActive: legacyConv.active,
          createdAt: legacyConv.createdAt,
          updatedAt: legacyConv.updatedAt
        }
      } else {
        // Already in correct format
        normalizedConv = conv as Conversation
      }
      
      // Ensure we have unreadCounts property (for legacy conversations that might not have it)
      const unreadCounts = normalizedConv.unreadCounts || {}
      
      return {
        ...normalizedConv,
        _id: normalizedConv._id!.toString(),
        unreadCount: unreadCounts?.[userObjectId.toString()] || 0,
        otherParticipants: normalizedConv.participants.filter(p => p.userId.toString() !== userObjectId.toString())
      }
    })

    return NextResponse.json({ conversations: transformedConversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured()) {
      console.log('Database not configured, using mock conversation creation')
      
      // Create a mock conversation for testing without database
      const { participantId, participantRole } = await request.json()
      
      const mockConversation = {
        _id: `mock-conv-${Date.now()}`,
        participants: [
          {
            userId: 'current-user',
            role: 'student',
            name: 'Current User',
            email: 'user@example.com'
          },
          {
            userId: participantId,
            role: participantRole || 'admin',
            name: participantId === 'admin' ? 'Admin Support' : 'User',
            email: participantId === 'admin' ? 'admin@roommatch.pk' : 'user@example.com'
          }
        ],
        unreadCounts: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        otherParticipants: [{
          userId: participantId,
          role: participantRole || 'admin',
          name: participantId === 'admin' ? 'Admin Support' : 'User',
          email: participantId === 'admin' ? 'admin@roommatch.pk' : 'user@example.com'
        }]
      }
      
      return NextResponse.json({ 
        success: true,
        conversation: mockConversation 
      })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - no session' }, { status: 401 })
    }

    const { participantId, participantRole } = await request.json()
    console.log('Creating conversation with:', { 
      participantId, 
      participantRole, 
      currentUserEmail: session.user.email,
      adminEmail: process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL || process.env.DEFAULT_ADMIN_EMAIL
    })

    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 })
    }

    const db = await getDatabase()
    const conversationsCollection = db.collection<ConversationDocument>('conversations')
    const usersCollection = db.collection('users')

    // Find current user by email
    const currentUser = await usersCollection.findOne({ email: session.user.email })
    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found in database' }, { status: 404 })
    }
    const currentUserObjectId = currentUser._id

    // Find participant
    let participant: any
    let participantObjectId: ObjectId

    // Handle admin conversation
    const adminEmails = [
      process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL,
      process.env.DEFAULT_ADMIN_EMAIL,
      'admin@roommatchpk.com',
      'admin@roommatch.pk'
    ].filter(Boolean)

    if (participantId === 'admin' || adminEmails.includes(participantId)) {
      // Find any admin user
      participant = await usersCollection.findOne({ 
        $or: [
          { role: 'admin' },
          { email: { $in: adminEmails } }
        ]
      })
      
      if (!participant) {
        // Create default admin user
        const adminEmail = adminEmails[0] || 'admin@roommatch.pk'
        const adminUser = {
          name: 'Admin Support',
          email: adminEmail,
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const adminResult = await usersCollection.insertOne(adminUser)
        participant = { ...adminUser, _id: adminResult.insertedId }
      }
      
      participantObjectId = participant._id
    } else {
      // Regular user conversation
      if (ObjectId.isValid(participantId)) {
        participant = await usersCollection.findOne({ _id: new ObjectId(participantId) })
      } else {
        participant = await usersCollection.findOne({ email: participantId })
      }
      
      if (!participant) {
        return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
      }
      participantObjectId = participant._id
    }

    // Check if conversation already exists (try both formats)
    let existingConversation = await conversationsCollection.findOne({
      $and: [
        { 'participants.userId': currentUserObjectId },
        { 'participants.userId': participantObjectId }
      ]
    })
    
    // If not found in complex format, try simple format
    if (!existingConversation) {
      existingConversation = await conversationsCollection.findOne({
        $or: [
          { $and: [{ user1: currentUserObjectId }, { user2: participantObjectId }] },
          { $and: [{ user1: participantObjectId }, { user2: currentUserObjectId }] }
        ]
      })
      
      // Transform simple format to complex format for consistency
      if (existingConversation && isLegacyConversation(existingConversation)) {
        const legacyConv = existingConversation as LegacyConversation
        if (legacyConv._id) {
          existingConversation = {
            _id: legacyConv._id,
            participants: [
              {
                userId: legacyConv.user1,
                role: legacyConv.user1Role,
                name: legacyConv.user1Name,
                email: legacyConv.user1Email
              },
              {
                userId: legacyConv.user2,
                role: legacyConv.user2Role,
                name: legacyConv.user2Name,
                email: legacyConv.user2Email
              }
            ],
            unreadCounts: {},
            isActive: legacyConv.active,
            createdAt: legacyConv.createdAt,
            updatedAt: legacyConv.updatedAt
          }
        }
      }
    }

    if (existingConversation) {
      // Ensure we have a conversation in the correct format
      let normalizedConversation: Conversation
      
      if (isLegacyConversation(existingConversation)) {
        // Transform legacy conversation to new format
        const legacyConv = existingConversation as LegacyConversation
        normalizedConversation = {
          _id: legacyConv._id!,
          participants: [
            {
              userId: legacyConv.user1,
              role: legacyConv.user1Role,
              name: legacyConv.user1Name,
              email: legacyConv.user1Email
            },
            {
              userId: legacyConv.user2,
              role: legacyConv.user2Role,
              name: legacyConv.user2Name,
              email: legacyConv.user2Email
            }
          ],
          unreadCounts: {},
          isActive: legacyConv.active,
          createdAt: legacyConv.createdAt,
          updatedAt: legacyConv.updatedAt
        }
      } else {
        // Already in correct format
        normalizedConversation = existingConversation as Conversation
      }
      
      const transformedConversation = {
        ...normalizedConversation,
        _id: normalizedConversation._id!.toString(),
        otherParticipants: normalizedConversation.participants.filter(p => 
          p.userId.toString() !== currentUserObjectId.toString()
        )
      }
      return NextResponse.json({ conversation: transformedConversation })
    }

    // Create new conversation with simplified structure to avoid validation issues
    const newConversation = {
      participants: [
        {
          userId: currentUserObjectId,
          role: currentUser.role || 'student',
          name: currentUser.name || session.user.name || 'User',
          email: currentUser.email
        },
        {
          userId: participantObjectId,
          role: participant.role || 'student',
          name: participant.name || 'User',
          email: participant.email
        }
      ],
      unreadCounts: {},
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Try to insert without strict validation
    let result
    let conversation: Conversation | null = null
    try {
      result = await conversationsCollection.insertOne(newConversation)
      const foundConversation = await conversationsCollection.findOne({ _id: result.insertedId })
      if (foundConversation) {
        // The newConversation structure should always result in a Conversation format
        conversation = foundConversation as Conversation
      }
    } catch (validationError) {
      console.log('MongoDB validation failed, trying alternative approach:', validationError)
      
      // If validation fails, try with even simpler structure
      const simpleConversation = {
        user1: currentUserObjectId,
        user1Email: currentUser.email,
        user1Name: currentUser.name || session.user.name || 'User',
        user1Role: currentUser.role || 'student',
        user2: participantObjectId,
        user2Email: participant.email,
        user2Name: participant.name || 'User',
        user2Role: participant.role || 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true
      }
      
      result = await conversationsCollection.insertOne(simpleConversation)
      const simpleConv = await conversationsCollection.findOne({ _id: result.insertedId })
      
      // Transform simple conversation to expected format
      if (simpleConv && isLegacyConversation(simpleConv)) {
        const legacyConv = simpleConv as LegacyConversation
        if (legacyConv._id) {
          conversation = {
            _id: legacyConv._id,
            participants: [
              {
                userId: legacyConv.user1,
                role: legacyConv.user1Role,
                name: legacyConv.user1Name,
                email: legacyConv.user1Email
              },
              {
                userId: legacyConv.user2,
                role: legacyConv.user2Role,
                name: legacyConv.user2Name,
                email: legacyConv.user2Email
              }
            ],
            unreadCounts: {},
            isActive: legacyConv.active,
            createdAt: legacyConv.createdAt,
            updatedAt: legacyConv.updatedAt
          } as Conversation
        }
      }
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    const transformedConversation = {
      ...conversation,
      _id: conversation._id?.toString() || '',
      otherParticipants: conversation.participants.filter(p => 
        p.userId.toString() !== currentUserObjectId.toString()
      )
    }

    return NextResponse.json({ 
      success: true,
      conversation: transformedConversation 
    })
  } catch (error) {
    console.error('Error creating conversation:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ 
      error: 'Failed to create conversation',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
