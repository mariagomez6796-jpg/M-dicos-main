"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { getChatSocket, type Message, type Conversation, type Participant } from "@/lib/chat-socket"
import { chatApi } from "@/lib/chat-api"
import { authService } from "@/lib/auth"
import { toast } from "sonner"

interface ChatContextType {
  // State
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Message[]
  isConnected: boolean
  isLoading: boolean
  typingUsers: Set<number>
  
  // Actions
  loadConversations: () => Promise<void>
  selectConversation: (conversationId: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  loadMoreMessages: () => Promise<void>
  createConversation: (appointmentId: number) => Promise<Conversation | null>
  markMessagesAsRead: (conversationId: string) => void
  
  // WebSocket status
  connect: () => void
  disconnect: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  
  const socketRef = useRef(getChatSocket())
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = socketRef.current
    const user = authService.getCurrentUser()
    
    if (!user) return

    // Connect to WebSocket
    socket.connect()

    // Setup event listeners
    const unsubscribers = [
      socket.on("connected", (data) => {
        console.log("✅ Chat connected:", data)
        setIsConnected(true)
        toast.success("Conectado al chat")
      }),

      socket.on("message_received", (data) => {
        const newMessage: Message = data.message
        
        // Add message to list if it's for the active conversation
        if (activeConversation && newMessage.conversation_id === activeConversation.conversation_id) {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.message_id === newMessage.message_id)) {
              return prev
            }
            return [...prev, newMessage]
          })
          
          // Mark as read if conversation is active
          socket.markAsRead(newMessage.message_id)
        }
        
        // Update conversation list
        updateConversationLastMessage(newMessage)
      }),

      socket.on("message_delivered", (data) => {
        updateMessageStatus(data.message_id, "delivered")
      }),

      socket.on("message_read", (data) => {
        updateMessageStatus(data.message_id, "read")
      }),

      socket.on("user_typing", (data) => {
        if (activeConversation && data.conversation_id === activeConversation.conversation_id) {
          setTypingUsers((prev) => new Set(prev).add(data.user_id))
          
          // Clear typing indicator after 3 seconds
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
          }
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUsers((prev) => {
              const next = new Set(prev)
              next.delete(data.user_id)
              return next
            })
          }, 3000)
        }
      }),

      socket.on("conversation_expired", (data) => {
        toast.warning("La conversación ha expirado y es de solo lectura")
        updateConversationStatus(data.conversation_id, "expired")
      }),

      socket.on("error", (data) => {
        console.error("Chat error:", data)
        toast.error(data.message || "Error en el chat")
      }),
    ]

    // Cleanup
    return () => {
      unsubscribers.forEach((unsub) => unsub())
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [activeConversation])

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await chatApi.getConversations(1, 20)
      setConversations(response.conversations)
    } catch (error) {
      console.error("Error loading conversations:", error)
      toast.error("Error al cargar conversaciones")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Select and load conversation
  const selectConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true)
      
      // Get conversation details
      const conversation = await chatApi.getConversation(conversationId)
      setActiveConversation(conversation)
      
      // Load messages
      const response = await chatApi.getMessages(conversationId, 1, 50)
      setMessages(response.messages.reverse()) // Reverse to show oldest first
      setCurrentPage(1)
      setHasMoreMessages(response.has_more)
      
      // Join conversation via WebSocket
      socketRef.current.joinConversation(conversationId)
      
      // Mark messages as read
      markMessagesAsRead(conversationId)
    } catch (error) {
      console.error("Error selecting conversation:", error)
      toast.error("Error al cargar la conversación")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!activeConversation || !hasMoreMessages || isLoading) return

    try {
      setIsLoading(true)
      const nextPage = currentPage + 1
      const response = await chatApi.getMessages(activeConversation.conversation_id, nextPage, 50)
      
      setMessages((prev) => [...response.messages.reverse(), ...prev])
      setCurrentPage(nextPage)
      setHasMoreMessages(response.has_more)
    } catch (error) {
      console.error("Error loading more messages:", error)
      toast.error("Error al cargar más mensajes")
    } finally {
      setIsLoading(false)
    }
  }, [activeConversation, currentPage, hasMoreMessages, isLoading])

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!activeConversation || !content.trim()) return

    try {
      // Send via WebSocket for real-time delivery
      socketRef.current.sendMessage(activeConversation.conversation_id, content.trim())
      
      // Optimistically add message to UI
      const tempMessage: Message = {
        message_id: `temp-${Date.now()}`,
        conversation_id: activeConversation.conversation_id,
        sender_id: authService.getCurrentUser()?.email ? 0 : 0, // Will be replaced by server
        sender_type: "patient",
        content: content.trim(),
        message_type: "text",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      }
      
      setMessages((prev) => [...prev, tempMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Error al enviar mensaje")
    }
  }, [activeConversation])

  // Create new conversation
  const createConversation = useCallback(async (appointmentId: number): Promise<Conversation | null> => {
    try {
      const conversation = await chatApi.createConversation(appointmentId)
      setConversations((prev) => [conversation, ...prev])
      toast.success("Conversación creada")
      return conversation
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast.error("Error al crear conversación")
      return null
    }
  }, [])

  // Mark messages as read
  const markMessagesAsRead = useCallback((conversationId: string) => {
    const unreadMessages = messages.filter(
      (m) => m.conversation_id === conversationId && m.sender_type !== "patient"
    )
    
    unreadMessages.forEach((message) => {
      socketRef.current.markAsRead(message.message_id)
    })
  }, [messages])

  // Helper: Update message status
  const updateMessageStatus = (messageId: string, status: "delivered" | "read") => {
    setMessages((prev) =>
      prev.map((m) => (m.message_id === messageId ? { ...m, status } : m))
    )
  }

  // Helper: Update conversation last message
  const updateConversationLastMessage = (message: Message) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.conversation_id === message.conversation_id
          ? {
              ...conv,
              last_message: message.content,
              last_message_at: message.created_at,
              unread_count: (conv.unread_count || 0) + 1,
            }
          : conv
      )
    )
  }

  // Helper: Update conversation status
  const updateConversationStatus = (conversationId: string, status: "active" | "expired" | "archived") => {
    setConversations((prev) =>
      prev.map((conv) => (conv.conversation_id === conversationId ? { ...conv, status } : conv))
    )
    
    if (activeConversation?.conversation_id === conversationId) {
      setActiveConversation((prev) => (prev ? { ...prev, status } : null))
    }
  }

  // Connect/Disconnect
  const connect = useCallback(() => {
    socketRef.current.connect()
  }, [])

  const disconnect = useCallback(() => {
    socketRef.current.disconnect()
    setIsConnected(false)
  }, [])

  const value: ChatContextType = {
    conversations,
    activeConversation,
    messages,
    isConnected,
    isLoading,
    typingUsers,
    loadConversations,
    selectConversation,
    sendMessage,
    loadMoreMessages,
    createConversation,
    markMessagesAsRead,
    connect,
    disconnect,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

// Made with Bob
