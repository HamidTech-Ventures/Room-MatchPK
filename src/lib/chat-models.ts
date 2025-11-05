import { ObjectId } from 'mongodb'

export interface ChatMessage {
  _id?: ObjectId
  senderId: ObjectId
  receiverId: ObjectId
  message: string
  timestamp: Date
  isRead: boolean
  messageType: 'text' | 'system'
  conversationId: string // Format: "senderId_receiverId" (alphabetically sorted)
  senderName: string
  senderRole: 'student' | 'owner' | 'admin'
  receiverName: string
  receiverRole: 'student' | 'owner' | 'admin'
}

export interface Conversation {
  _id?: ObjectId
  conversationId: string
  participants: {
    userId: ObjectId
    name: string
    role: 'student' | 'owner' | 'admin'
  }[]
  lastMessage: {
    message: string
    timestamp: Date
    senderId: ObjectId
  }
  unreadCount: {
    [userId: string]: number
  }
  createdAt: Date
  updatedAt: Date
}

export type CreateDocument<T> = Omit<T, '_id'>
