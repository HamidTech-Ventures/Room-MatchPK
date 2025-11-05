"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle, 
  Send, 
  Search, 
  User, 
  GraduationCap,
  Building,
  Loader2,
  ArrowLeft,
  MoreVertical,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface AdminConversation {
  id: string
  participants: string[]
  participantNames: string[]
  createdAt: string | Date
  lastMessage: string | null
  otherParticipant: string
  otherParticipantName: string
  otherParticipantRole?: string
  unreadCount?: number
}

interface AdminMessage {
  id: string
  conversationId: string
  sender: string
  senderName: string
  text: string
  createdAt: string | Date
  isOwnMessage: boolean
}

export function AdminChatManagement() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<AdminConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null)
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (user?.role === 'admin') {
      loadConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const makeAPICall = async (action: string, data: any = {}) => {
    const response = await fetch('/api/simple-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...data }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  }

  const loadConversations = async () => {
    setIsLoadingConversations(true)
    try {
      console.log('Admin: Loading conversations...')
      const result = await makeAPICall('get_conversations')
      console.log('Admin: Conversation result:', result)
      if (result.success) {
        setConversations(result.conversations || [])
        console.log('Admin: Loaded conversations:', result.conversations?.length || 0)
      } else {
        console.error('Admin: Failed to get conversations:', result.error)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    setIsLoadingMessages(true)
    try {
      const result = await makeAPICall('get_messages', { conversationId })
      if (result.success) {
        setMessages(result.messages || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setIsSendingMessage(true)

    try {
      const result = await makeAPICall('send_message', {
        conversationId: selectedConversation.id,
        text: messageText
      })

      if (result.success) {
        setMessages(prev => [...prev, result.message])
        scrollToBottom()
        
        // Update conversation list
        loadConversations()
      } else {
        throw new Error(result.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      setNewMessage(messageText) // Restore message on error
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <User className="w-3 h-3" />
    if (role === 'owner') return <Building className="w-3 h-3" />
    return <GraduationCap className="w-3 h-3" />
  }

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'Admin'
    if (role === 'owner') return 'Owner'
    return 'Student'
  }

  const getRoleColor = (role: string) => {
    if (role === 'admin') return 'bg-red-100 text-red-700'
    if (role === 'owner') return 'bg-blue-100 text-blue-700'
    return 'bg-green-100 text-green-700'
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

  const filteredConversations = conversations.filter(conv =>
    conv.otherParticipantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherParticipant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Chat Management</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadConversations}
                className="h-8 w-8 p-0"
                title="Refresh conversations"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingConversations ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[460px]">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-slate-500 px-4">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No conversations found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchQuery ? 'Try a different search term' : 'Users will appear here when they start chatting'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conv) => (
                    <Card
                      key={conv.id}
                      className={`cursor-pointer transition-colors border-slate-200 ${
                        selectedConversation?.id === conv.id 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-slate-100 text-slate-600 text-sm">
                              {conv.otherParticipantName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-sm text-slate-800 truncate">
                                  {conv.otherParticipantName}
                                </p>
                                <Badge className={`text-xs ${getRoleColor(conv.otherParticipantRole || 'student')}`}>
                                  {getRoleLabel(conv.otherParticipantRole || 'student')}
                                </Badge>
                              </div>
                              {conv.unreadCount && conv.unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {conv.lastMessage || 'No messages yet'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {formatTime(conv.createdAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          {!selectedConversation ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-sm">Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden p-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-sm">
                      {selectedConversation.otherParticipantName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-slate-800">
                        {selectedConversation.otherParticipantName}
                      </h3>
                      <Badge className={`text-xs ${getRoleColor(selectedConversation.otherParticipantRole || 'student')}`}>
                        {getRoleLabel(selectedConversation.otherParticipantRole || 'student')}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {selectedConversation.otherParticipant}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="p-0 flex flex-col" style={{ height: 'calc(100% - 120px)' }}>
                <ScrollArea className="flex-1 p-4">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs text-slate-400 mt-1">Start the conversation by sending a message</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                            {!message.isOwnMessage && (
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                                  {message.senderName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`px-3 py-2 rounded-lg text-sm ${
                                message.isOwnMessage
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {!message.isOwnMessage && (
                                <p className="text-xs font-medium mb-1 opacity-70">
                                  {message.senderName}
                                </p>
                              )}
                              <p>{message.text}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.isOwnMessage ? 'text-blue-100' : 'text-slate-500'
                                }`}
                              >
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                            {message.isOwnMessage && (
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                  A
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-slate-50">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your response..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSendingMessage}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSendingMessage}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSendingMessage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
