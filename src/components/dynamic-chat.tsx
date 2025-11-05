"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Plus
} from "lucide-react"
import { toast } from "sonner"

interface Message {
  _id: string
  conversationId: string
  senderId: string
  senderRole: 'student' | 'owner' | 'admin'
  text: string
  messageType?: 'text' | 'image' | 'file'
  attachments?: string[]
  readBy: Array<{
    userId: string
    readAt: Date
  }>
  isDeleted?: boolean
  createdAt: Date
  updatedAt?: Date
}

interface Conversation {
  _id: string
  participants: Array<{
    userId: string
    role: 'student' | 'owner' | 'admin'
    name: string
    email: string
    avatar?: string
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
    avatar?: string
  }>
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface User {
  _id: string
  name: string
  email: string
  role: 'student' | 'owner' | 'admin'
  avatar?: string
}

interface DynamicChatProps {
  isOpen: boolean
  onToggle: () => void
}

export function DynamicChat({ isOpen, onToggle }: DynamicChatProps) {
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
  const [showSearch, setShowSearch] = useState(false)
  const [adminContact, setAdminContact] = useState<User | null>(null)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Polling for real-time updates (simplified without WebSocket)
  const startPolling = () => {
    if (pollingIntervalRef.current) return

    pollingIntervalRef.current = setInterval(async () => {
      if (selectedConversation) {
        try {
          // Poll for new messages
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

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

  // Load conversations and admin contact when chat opens (only once)
  useEffect(() => {
    if (isOpen && user && conversations.length === 0) {
      loadConversations()
      loadAdminContact()
    }
  }, [isOpen, user])

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id)
      markMessagesAsRead(selectedConversation._id)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    if (!user) return
    
    setIsLoadingConversations(true)
    try {
      const response = await fetch('/api/chat/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      } else {
        // Handle different status codes appropriately
        if (response.status === 400) {
          // 400 usually means no conversations found, which is normal
          setConversations([])
        } else if (response.status === 401) {
          // Unauthorized - user might need to log in again
          toast.error('Please log in again to access chat')
        } else if (response.status >= 500) {
          // Server errors
          toast.error('Chat service is temporarily unavailable')
        } else {
          // Other client errors
          toast.error('Unable to load conversations')
        }
      }
    } catch (error) {
      // Only show error for actual network/connection issues
      console.error('Network error loading conversations:', error)
      toast.error('Connection error. Please check your internet connection.')
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const loadAdminContact = async () => {
    if (!user || user.role === 'admin') return
    
    try {
      const response = await fetch('/api/chat/users/search?email=admin@roommatch.pk')
      if (response.ok) {
        const data = await response.json()
        if (data.users && data.users.length > 0) {
          setAdminContact(data.users[0])
        }
      }
      // Silently fail for admin contact loading - not critical
    } catch (error) {
      // Silently fail for admin contact loading - not critical
    }
  }

  const loadMessages = async (conversationId: string) => {
    setIsLoadingMessages(true)
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        // Handle different status codes appropriately
        if (response.status === 400) {
          // No messages found, which is normal for new conversations
          setMessages([])
        } else if (response.status === 401) {
          toast.error('Please log in again to access messages')
        } else if (response.status === 404) {
          toast.error('Conversation not found')
          setSelectedConversation(null)
        } else if (response.status >= 500) {
          toast.error('Unable to load messages. Please try again.')
        }
      }
    } catch (error) {
      console.error('Network error loading messages:', error)
      toast.error('Connection error. Please check your internet connection.')
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const response = await fetch('/api/chat/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId }),
      })
      
      if (response.ok) {
        // Update local state to reflect read status
        setConversations(prev => prev.map(conv => 
          conv._id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        ))
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
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
      senderId: user.id,
      senderRole: user.role as 'student' | 'owner' | 'admin',
      text: messageText,
      readBy: [],
      createdAt: new Date(),
    }

    setMessages(prev => [...prev, tempMessage])

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          text: messageText,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Replace temp message with real message
        setMessages(prev => prev.map(msg => 
          msg._id === tempMessage._id ? data.message : msg
        ))

        // Update conversation list
        setConversations(prev => prev.map(conv => 
          conv._id === selectedConversation._id 
            ? { 
                ...conv, 
                lastMessage: {
                  text: messageText,
                  senderId: user.id,
                  timestamp: new Date()
                },
                updatedAt: new Date()
              }
            : conv
        ))

        scrollToBottom()
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id))
        
        const error = await response.json()
        toast.error('Failed to send message: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id))
      
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
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
        setSearchResults(data.users || [])
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
    
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    const timeout = setTimeout(() => {
      searchUsers(value)
    }, 300)
    
    setSearchTimeout(timeout)
  }

  const startConversation = async (participant: User) => {
    if (!user) return

    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: participant._id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newConversation = data.conversation
        
        // Add to conversations list
        setConversations(prev => [newConversation, ...prev])
        
        // Select the new conversation
        setSelectedConversation(newConversation)
        
        // Clear search
        setSearchQuery("")
        setSearchResults([])
        setShowSearch(false)
        
        toast.success(`Started conversation with ${participant.name}`)
      } else {
        const error = await response.json()
        toast.error('Failed to start conversation: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
      toast.error('Failed to start conversation. Please try again.')
    }
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
        return 'bg-red-100 text-red-700'
      case 'owner':
        return 'bg-blue-100 text-blue-700'
      case 'student':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatTime = (date: Date | string) => {
    const messageDate = new Date(date)
    const now = new Date()
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return messageDate.toLocaleDateString()
    }
  }

  const isCurrentUser = (senderId: string) => {
    return senderId === user?.id
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
      <div className="w-full max-w-md h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Chat</h3>
              <p className="text-xs text-slate-600">
                {selectedConversation ? 'Active conversation' : 'Start chatting'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {!selectedConversation ? (
            // Conversations List
            <div className="flex-1 flex flex-col">
              {/* Search Bar */}
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Search Results */}
              {searchQuery && (
                <div className="p-4 border-b border-slate-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Search Results</h4>
                  {isSearching ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                          onClick={() => startConversation(user)}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xs">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-slate-800 truncate">
                                {user.name}
                              </span>
                              <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                                {user.role}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Plus className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No users found</p>
                  )}
                </div>
              )}

              {/* Conversations List */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {isLoadingConversations ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : conversations.length > 0 ? (
                    conversations.map((conversation) => {
                      const otherParticipant = conversation.otherParticipants[0]
                      return (
                        <div
                          key={conversation._id}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedConversation && (selectedConversation as Conversation)._id === conversation._id
                              ? 'bg-emerald-50 border border-emerald-200'
                              : 'hover:bg-slate-50'
                          }`}
                          onClick={() => setSelectedConversation(conversation)}
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={otherParticipant?.avatar} />
                            <AvatarFallback className="text-sm">
                              {otherParticipant?.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-slate-800 truncate">
                                {otherParticipant?.name}
                              </span>
                              <Badge className={`text-xs ${getRoleColor(otherParticipant?.role || '')}`}>
                                {otherParticipant?.role}
                              </Badge>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-red-500 text-white text-xs">
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
                          {conversation.lastMessage && (
                            <span className="text-xs text-slate-400">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No conversations yet</p>
                      <p className="text-xs text-slate-400 mt-1">Search for users to start chatting</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            // Chat Messages
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedConversation.otherParticipants[0]?.avatar} />
                    <AvatarFallback className="text-xs">
                      {selectedConversation.otherParticipants[0]?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-slate-800">
                        {selectedConversation.otherParticipants[0]?.name}
                      </span>
                      <Badge className={`text-xs ${getRoleColor(selectedConversation.otherParticipants[0]?.role || '')}`}>
                        {selectedConversation.otherParticipants[0]?.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {selectedConversation.otherParticipants[0]?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${isCurrentUser(message.senderId) ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isCurrentUser(message.senderId)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <div className={`flex items-center justify-between mt-1 ${
                            isCurrentUser(message.senderId) ? 'text-emerald-100' : 'text-slate-500'
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
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No messages yet</p>
                    <p className="text-xs text-slate-400 mt-1">Start the conversation!</p>
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSendingMessage}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSendingMessage}
                    className="bg-emerald-600 hover:bg-emerald-700"
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
    </div>
  )
}