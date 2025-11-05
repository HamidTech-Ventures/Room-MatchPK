"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  MessageCircle, 
  X, 
  Send, 
  Search, 
  User, 
  Shield, 
  GraduationCap,
  Building,
  Loader2,
  Plus
} from "lucide-react"
import { toast } from "sonner"

interface SimpleConversation {
  id: string
  participants: string[]
  participantNames: string[]
  createdAt: string | Date
  lastMessage: string | null
  otherParticipant: string
  otherParticipantName: string
}

interface SimpleMessage {
  id: string
  conversationId: string
  sender: string
  senderName: string
  text: string
  createdAt: string | Date
  isOwnMessage: boolean
}

interface SimpleChatProps {
  isOpen: boolean
  onToggle: () => void
}

export function SimpleChat({ isOpen, onToggle }: SimpleChatProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<SimpleConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<SimpleConversation | null>(null)
  const [messages, setMessages] = useState<SimpleMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [newChatEmail, setNewChatEmail] = useState("")
  const [newChatName, setNewChatName] = useState("")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversations when chat opens
  useEffect(() => {
    if (isOpen && user) {
      loadConversations()
    }
  }, [isOpen, user])

  // Load messages when conversation is selected
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
    if (!user) return
    
    setIsLoadingConversations(true)
    try {
      const result = await makeAPICall('get_conversations')
      if (result.success) {
        setConversations(result.conversations || [])
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

  const startNewConversation = async () => {
    if (!newChatEmail.trim() || !user) return

    try {
      const result = await makeAPICall('create_conversation', {
        participantEmail: newChatEmail.trim(),
        participantName: newChatName.trim() || 'User'
      })

      if (result.success) {
        const newConv: SimpleConversation = {
          ...result.conversation,
          otherParticipant: newChatEmail.trim(),
          otherParticipantName: newChatName.trim() || 'User'
        }
        
        setConversations(prev => [newConv, ...prev])
        setSelectedConversation(newConv)
        setShowNewChat(false)
        setNewChatEmail("")
        setNewChatName("")
        
        toast.success(`Started conversation with ${newChatName || newChatEmail}`)
      } else {
        throw new Error(result.error || 'Failed to create conversation')
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to start conversation')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getRoleIcon = (email: string) => {
    if (email.includes('admin')) return <Shield className="w-3 h-3" />
    if (user?.role === 'owner') return <Building className="w-3 h-3" />
    return <GraduationCap className="w-3 h-3" />
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
            <h3 className="font-semibold text-slate-800 text-sm">Simple Chat</h3>
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
            {/* New Chat Button */}
            <div className="p-3 border-b border-slate-200">
              <Button
                onClick={() => setShowNewChat(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
            </div>

            {/* New Chat Form */}
            {showNewChat && (
              <div className="p-3 border-b border-slate-200 bg-slate-50">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter email address"
                    value={newChatEmail}
                    onChange={(e) => setNewChatEmail(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Enter name (optional)"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={startNewConversation}
                      disabled={!newChatEmail.trim()}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Start Chat
                    </Button>
                    <Button
                      onClick={() => setShowNewChat(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Conversations List */}
            <ScrollArea className="flex-1 p-2">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs text-slate-400 mt-1">Start a new chat to get going!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <Card
                      key={conv.id}
                      className="cursor-pointer hover:bg-slate-50 transition-colors border-slate-200"
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
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-sm text-slate-800 truncate">
                                {conv.otherParticipantName}
                              </p>
                              {getRoleIcon(conv.otherParticipant)}
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {conv.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          // Chat View
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-3 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversation(null)}
                  className="p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-sm">
                    {selectedConversation.otherParticipantName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-slate-800">
                    {selectedConversation.otherParticipantName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedConversation.otherParticipant}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs text-slate-400 mt-1">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.isOwnMessage
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.isOwnMessage ? 'text-green-100' : 'text-slate-500'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
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
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSendingMessage}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
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
