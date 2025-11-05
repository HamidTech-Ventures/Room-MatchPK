"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageCircle, 
  X, 
  Send, 
  Search, 
  User, 
  Shield, 
  GraduationCap,
  Building,
  Check,
  CheckCheck,
  Loader2,
  Plus,
  HeadphonesIcon
} from "lucide-react"
import { toast } from "sonner"

// Environment variables with fallback defaults
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@roommatch.pk'
const ADMIN_NAME = process.env.NEXT_PUBLIC_ADMIN_NAME || 'Admin Support'

// Support multiple admin emails - split by comma if provided
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS 
  ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map(email => email.trim())
  : [ADMIN_EMAIL, 'admin@roommatch.pk', 'admin@roommatchpk.com']

// LocalStorage keys for persistence
const STORAGE_KEYS = {
  CONVERSATIONS: 'unified-chat-conversations',
  SELECTED_CONVERSATION: 'unified-chat-selected-conversation'
} as const

interface Message {
  _id: string
  conversationId: string
  senderId: string
  senderRole: 'student' | 'owner' | 'admin'
  text: string
  createdAt: Date
  readBy: string[]
}

interface Conversation {
  _id: string
  participants: Array<{
    userId: string
    role: 'student' | 'owner' | 'admin'
    name: string
    email: string
  }>
  lastMessage?: {
    text: string
    senderId: string
    timestamp: Date
  }
  unreadCount: number
  otherParticipants: Array<{
    userId: string
    role: 'student' | 'owner' | 'admin'
    name: string
    email: string
  }>
}

interface User {
  _id: string
  name: string
  email: string
  role: 'student' | 'owner' | 'admin'
}

interface UnifiedChatProps {
  isOpen: boolean
  onToggle: () => void
}

export function UnifiedChat({ isOpen, onToggle }: UnifiedChatProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [adminContact, setAdminContact] = useState<User | null>(null)
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load conversations and selected conversation from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      try {
        // Load conversations from localStorage
        const savedConversations = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)
        if (savedConversations) {
          const parsed = JSON.parse(savedConversations)
          if (Array.isArray(parsed)) {
            setConversations(parsed)
          }
        }

        // Load selected conversation from localStorage
        const savedSelectedConversation = localStorage.getItem(STORAGE_KEYS.SELECTED_CONVERSATION)
        if (savedSelectedConversation) {
          const parsed = JSON.parse(savedSelectedConversation)
          if (parsed && parsed._id) {
            setSelectedConversation(parsed)
          }
        }
      } catch (error) {
        console.error('Error loading chat data from localStorage:', error)
        // Clear corrupted localStorage data
        localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS)
        localStorage.removeItem(STORAGE_KEYS.SELECTED_CONVERSATION)
      }
    }
  }, [user])

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && conversations.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations))
      } catch (error) {
        console.error('Error saving conversations to localStorage:', error)
      }
    }
  }, [conversations])

  // Save selected conversation to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (selectedConversation) {
          localStorage.setItem(STORAGE_KEYS.SELECTED_CONVERSATION, JSON.stringify(selectedConversation))
        } else {
          localStorage.removeItem(STORAGE_KEYS.SELECTED_CONVERSATION)
        }
      } catch (error) {
        console.error('Error saving selected conversation to localStorage:', error)
      }
    }
  }, [selectedConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Polling for real-time updates
  const startPolling = () => {
    if (pollingIntervalRef.current) return

    pollingIntervalRef.current = setInterval(async () => {
      if (selectedConversation) {
        try {
          const response = await fetch(`/api/chat/messages?conversationId=${selectedConversation._id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.messages) {
              setMessages(data.messages)
            }
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }

      // Poll for conversation updates
      try {
        const response = await fetch('/api/chat/conversations')
        if (response.ok) {
          const data = await response.json()
          if (data.conversations) {
            setConversations(data.conversations)
          }
        }
      } catch (error) {
        console.error('Polling conversations error:', error)
      }
    }, 5000) // Poll every 5 seconds
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Start polling when chat is open
  useEffect(() => {
    if (isOpen && user) {
      startPolling()
    } else {
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [isOpen, user])

  // Load conversations when chat opens - always refresh from server to get latest data
  useEffect(() => {
    if (isOpen && user) {
      loadConversations()
      loadAdminContact()
    }
  }, [isOpen, user])

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    if (!user) return
    
    setIsLoadingConversations(true)
    try {
      const response = await fetch('/api/simple-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_conversations' })
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Transform simple conversations to unified format
          const transformedConversations = (data.conversations || []).map((conv: any) => ({
            _id: conv.id,
            participants: [
              { userId: user.email, name: user.name, email: user.email, role: user.role },
              { userId: conv.otherParticipant, name: conv.otherParticipantName, email: conv.otherParticipant, role: 'user' }
            ],
            otherParticipants: [{ userId: conv.otherParticipant, name: conv.otherParticipantName, email: conv.otherParticipant, role: 'user' }],
            lastMessage: { text: conv.lastMessage },
            createdAt: conv.createdAt,
            unreadCount: 0
          }))
          setConversations(transformedConversations)
          
          // Persist conversations to localStorage
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(transformedConversations))
            } catch (error) {
              console.error('Error saving conversations to localStorage:', error)
            }
          }
        } else {
          setConversations([])
        }
      } else {
        setConversations([])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      setConversations([])
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const loadAdminContact = async () => {
    if (!user || user.role === 'admin') return
    
    setIsLoadingAdmin(true)
    try {
      // Create a default admin contact for easy access using environment variables
      const defaultAdmin = {
        _id: 'admin-support',
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        role: 'admin' as const
      }
      setAdminContact(defaultAdmin)
    } catch (error) {
      console.error('Error loading admin contact:', error)
    } finally {
      setIsLoadingAdmin(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    setIsLoadingMessages(true)
    try {
      const response = await fetch('/api/simple-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_messages', conversationId })
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Transform simple messages to unified format
          const transformedMessages = (data.messages || []).map((msg: any) => ({
            _id: msg.id,
            conversationId: msg.conversationId,
            senderId: msg.sender,
            senderRole: msg.sender === user?.email ? user?.role || 'user' : 'user',
            text: msg.text,
            createdAt: new Date(msg.createdAt), // Ensure proper Date object
            readBy: []
          }))
          setMessages(transformedMessages)
        } else {
          setMessages([])
        }
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setIsSendingMessage(true)

    // Optimistically add message to UI
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      conversationId: selectedConversation._id,
      senderId: user.id || user.email || '',
      senderRole: user.role as 'student' | 'owner' | 'admin',
      text: messageText,
      readBy: [],
      createdAt: new Date(),
    }

    setMessages(prev => [...prev, tempMessage])

    try {
      const response = await fetch('/api/simple-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_message',
          conversationId: selectedConversation._id,
          text: messageText,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Replace temp message with real message
          const realMessage = {
            _id: data.message.id,
            conversationId: data.message.conversationId,
            senderId: data.message.sender,
            senderRole: user.role,
            text: data.message.text,
            createdAt: new Date(data.message.createdAt), // Ensure proper Date object
            readBy: []
          }
          setMessages(prev => prev.map(msg => 
            msg._id === tempMessage._id ? realMessage : msg
          ))
          scrollToBottom()
        } else {
          // Remove temp message on error
          setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id))
          toast.error('Failed to send message')
        }
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id))
        toast.error('Failed to send message')
      }
    } catch (error) {
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id))
      toast.error('Failed to send message')
    } finally {
      setIsSendingMessage(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/chat/users/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.users && data.users.length > 0) {
          // Filter out current user and all admin emails
          const filteredUsers = data.users.filter((searchUser: any) => 
            searchUser.email !== user?.email && 
            !ADMIN_EMAILS.includes(searchUser.email)
          )
          setSearchResults(filteredUsers)
        } else {
          setSearchResults([])
        }
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    
    if (value.length >= 2) {
      searchUsers(value)
    } else {
      setSearchResults([])
    }
  }

  const startConversation = async (participant: User) => {
    if (!user) return

    console.log('=== Starting Conversation Debug ===')
    console.log('Current user:', user)
    console.log('Target participant:', participant)
    
    try {
      const response = await fetch('/api/simple-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_conversation',
          participantEmail: participant.email,
          participantName: participant.name
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      // Get the raw response text first
      const responseText = await response.text()
      console.log('Raw response text:', responseText)
      
      // Try to parse as JSON
      let responseData
      try {
        responseData = JSON.parse(responseText)
        console.log('Parsed response data:', responseData)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        console.log('Response is not valid JSON')
        toast.error('Server returned invalid response')
        return
      }

      if (response.ok && responseData.success) {
        console.log('Conversation created successfully:', responseData)
        const newConversation = {
          _id: responseData.conversation.id,
          participants: [
            { userId: user.email, name: user.name, email: user.email, role: user.role },
            { userId: participant.email, name: participant.name, email: participant.email, role: participant.role }
          ],
          otherParticipants: [{ userId: participant.email, name: participant.name, email: participant.email, role: participant.role }],
          lastMessage: undefined,
          createdAt: responseData.conversation.createdAt,
          unreadCount: 0
        }
        
        setConversations(prev => {
          const updated = [newConversation, ...prev]
          // Persist updated conversations to localStorage
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updated))
            } catch (error) {
              console.error('Error saving conversations to localStorage:', error)
            }
          }
          return updated
        })
        setSelectedConversation(newConversation)
        setSearchQuery("")
        setSearchResults([])
        
        toast.success(`Started conversation with ${participant.name}`)
      } else {
        console.error('Conversation creation failed with status:', response.status)
        console.error('Error response data:', responseData)
        const errorMessage = responseData?.error || responseData?.message || `HTTP ${response.status}: ${response.statusText}`
        toast.error(`Failed to start conversation: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Network or other error starting conversation:', error)
      console.error('Error details:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        stack: (error as any)?.stack
      })
      toast.error('Failed to start conversation - network error')
    }
    
    console.log('=== End Conversation Debug ===')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3 h-3" />
      case 'owner':
        return <Building className="w-3 h-3" />
      case 'student':
        return <GraduationCap className="w-3 h-3" />
      default:
        return <User className="w-3 h-3" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-green-100 text-green-700'
      case 'owner':
        return 'bg-blue-100 text-blue-700'
      case 'student':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatTime = (date: Date | string) => {
    try {
      // Handle both Date objects and string dates
      const messageDate = typeof date === 'string' ? new Date(date) : date
      
      // Check if date is valid
      if (isNaN(messageDate.getTime())) {
        return 'Invalid date'
      }
      
      const now = new Date()
      const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 24) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else {
        return messageDate.toLocaleDateString()
      }
    } catch (error) {
      console.error('Error formatting time:', error)
      return 'Invalid date'
    }
  }

  const isCurrentUser = (senderId: string) => {
    // Check multiple possible identifiers for the current user
    const currentUserIdentifiers = [
      user?.email,
      user?.id
    ].filter(Boolean)
    
    return currentUserIdentifiers.includes(senderId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-green-50 to-green-100 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Chat</h3>
            <p className="text-xs text-slate-600">
              {selectedConversation ? 'Active conversation' : 'Start chatting'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-slate-500 hover:text-slate-700 h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {!selectedConversation ? (
          // Conversations List
          <div className="flex-1 flex flex-col">
            {/* Admin Contact Section */}
            {user && user.role !== 'admin' && (
              <div className="p-3 border-b border-slate-200 bg-gradient-to-r from-green-50 to-green-100">
                <h4 className="text-xs font-medium text-slate-700 mb-2 flex items-center">
                  <HeadphonesIcon className="w-3 h-3 mr-1" />
                  Need Help?
                </h4>
                {isLoadingAdmin ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  </div>
                ) : adminContact ? (
                  <div className="space-y-2">
                    <div
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-green-100 cursor-pointer transition-colors"
                      onClick={() => startConversation(adminContact)}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-green-100 text-green-700">
                          <Shield className="w-3 h-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-medium text-slate-800 truncate">
                            {adminContact.name}
                          </span>
                          <Badge className="text-xs bg-green-100 text-green-700">
                            Admin
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 truncate">Get help & support</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs h-6 px-2 border-green-200 text-green-700 hover:bg-green-100">
                        <Plus className="w-3 h-3 mr-1" />
                        Chat
                      </Button>
                    </div>
                    <Button
                      onClick={() => startConversation(adminContact)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat with Admin
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-slate-500">Admin contact not available</p>
                    <Button
                      onClick={() => {
                        // Create a temporary admin user object for direct chat using environment variables
                        const tempAdmin: User = {
                          _id: 'admin',
                          name: ADMIN_NAME,
                          email: ADMIN_EMAIL,
                          role: 'admin'
                        };
                        startConversation(tempAdmin)
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat with Admin
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Search Bar */}
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-9 text-sm"
                />
              </div>
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="p-3 border-b border-slate-200">
                <h4 className="text-xs font-medium text-slate-700 mb-2">Search Results</h4>
                {isSearching ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                        onClick={() => startConversation(user)}
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-medium text-slate-800 truncate">
                              {user.name}
                            </span>
                            <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                              {user.role}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                          <Plus className="w-3 h-3 mr-1" />
                          Chat
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-slate-500">No users found</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching by name or email</p>
                  </div>
                )}
              </div>
            )}

            {/* Conversations List */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1">
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((conversation, index) => {
                    const otherParticipant = conversation.otherParticipants[0]
                    // Generate unique key combining conversation ID and index to avoid duplicates
                    const uniqueKey = `${conversation._id}-${index}`
                    return (
                      <div
                        key={uniqueKey}
                      className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation && (selectedConversation as Conversation)._id === conversation._id
                          ? 'bg-green-50 border border-green-200'
                          : 'hover:bg-slate-50'
                      }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {otherParticipant?.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-medium text-slate-800 truncate">
                              {otherParticipant?.name}
                            </span>
                            <Badge className={`text-xs ${getRoleColor(otherParticipant?.role || '')}`}>
                              {otherParticipant?.role}
                            </Badge>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-green-500 text-white text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-xs text-slate-500 truncate">
                              {conversation.lastMessage.text}
                            </p>
                          )}
                        </div>
                        {conversation.lastMessage && conversation.lastMessage.timestamp && (
                          <span className="text-xs text-slate-400">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-4">
                    <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No conversations yet</p>
                    <p className="text-xs text-slate-400">Search for users or contact admin for help</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          // Chat Messages
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversation(null)}
                  className="text-slate-500 hover:text-slate-700 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {selectedConversation.otherParticipants[0]?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-slate-800">
                      {selectedConversation.otherParticipants[0]?.name}
                    </span>
                    <Badge className={`text-xs ${getRoleColor(selectedConversation.otherParticipants[0]?.role || '')}`}>
                      {selectedConversation.otherParticipants[0]?.role}
                    </Badge>
                  </div>
                  {selectedConversation.otherParticipants[0]?.role !== 'admin' && (
                    <p className="text-xs text-slate-500">
                      {selectedConversation.otherParticipants[0]?.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
                ) : messages.length > 0 ? (
                <div className="space-y-2">
                  {messages.map((message, index) => {
                    // Generate unique key combining message ID and index
                    const uniqueKey = `${message._id}-${index}`
                    return (
                    <div
                      key={uniqueKey}
                      className={`flex ${isCurrentUser(message.senderId) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                          isCurrentUser(message.senderId)
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <p className="text-xs">{message.text}</p>
                        <div className={`flex items-center justify-between mt-1 ${
                          isCurrentUser(message.senderId) ? 'text-green-100' : 'text-slate-500'
                        }`}>
                          <span className="text-xs">{formatTime(message.createdAt)}</span>
                          {isCurrentUser(message.senderId) && (
                            <div className="flex items-center space-x-1">
                              {message.readBy.length > 0 ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center py-4">
                  <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No messages yet</p>
                  <p className="text-xs text-slate-400">Start the conversation!</p>
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 border-t border-slate-200">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSendingMessage}
                  className="flex-1 h-9 text-sm"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSendingMessage}
                  className="bg-green-600 hover:bg-green-700 h-9 px-3"
                >
                  {isSendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}