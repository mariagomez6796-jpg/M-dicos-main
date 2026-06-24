import { io, Socket } from "socket.io-client"
import { authService } from "./auth"

const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || "http://localhost:8004"

export interface Message {
  message_id: string
  conversation_id: string
  sender_id: number
  sender_type: "doctor" | "patient" | "dependent"
  content: string
  message_type: "text" | "system" | "notification"
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MessageStatus {
  status_id: string
  message_id: string
  recipient_id: number
  status: "sent" | "delivered" | "read"
  status_at: string
}

export interface Conversation {
  conversation_id: string
  appointment_id: number
  status: "active" | "expired" | "archived"
  expires_at: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  participants: Participant[]
  message_count: number
  last_message_at: string | null
  last_message?: string
  unread_count?: number
}

export interface Participant {
  participant_id: string
  conversation_id: string
  user_id: number
  user_type: "doctor" | "patient" | "dependent"
  joined_at: string
  last_seen_at: string | null
  is_active: boolean
  name?: string
}

export type SocketEventType =
  | "authenticate"
  | "connected"
  | "join_conversation"
  | "send_message"
  | "message_received"
  | "message_delivered"
  | "message_read"
  | "mark_read"
  | "typing_start"
  | "typing_stop"
  | "user_typing"
  | "user_online"
  | "user_offline"
  | "conversation_expired"
  | "error"

export interface SocketEvent {
  type: SocketEventType
  [key: string]: any
}

export class ChatSocketManager {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private eventHandlers: Map<SocketEventType, Set<(data: any) => void>> = new Map()

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeSocket()
    }
  }

  private initializeSocket() {
    const user = authService.getCurrentUser()
    if (!user?.token) {
      console.warn("No authentication token found")
      return
    }

    this.socket = io(CHAT_API_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      autoConnect: false,
    })

    this.setupSocketListeners()
  }

  private setupSocketListeners() {
    if (!this.socket) return

    this.socket.on("connect", () => {
      console.log("✅ WebSocket connected")
      this.reconnectAttempts = 0
      this.authenticate()
    })

    this.socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason)
    })

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error)
      this.reconnectAttempts++
    })

    // Listen for all event types
    this.socket.onAny((eventType: string, data: any) => {
      const handlers = this.eventHandlers.get(eventType as SocketEventType)
      if (handlers) {
        handlers.forEach((handler) => handler(data))
      }
    })
  }

  private authenticate() {
    const user = authService.getCurrentUser()
    if (!user?.token || !this.socket) return

    this.emit("authenticate", { token: user.token })
  }

  connect() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect()
    } else if (!this.socket) {
      this.initializeSocket()
      this.socket?.connect()
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }

  emit(eventType: SocketEventType, data: any) {
    if (!this.socket || !this.socket.connected) {
      console.warn("Socket not connected. Cannot emit event:", eventType)
      return
    }

    this.socket.emit("message", { type: eventType, ...data })
  }

  on(eventType: SocketEventType, handler: (data: any) => void) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set())
    }
    this.eventHandlers.get(eventType)!.add(handler)

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType)
      if (handlers) {
        handlers.delete(handler)
      }
    }
  }

  off(eventType: SocketEventType, handler?: (data: any) => void) {
    if (handler) {
      const handlers = this.eventHandlers.get(eventType)
      if (handlers) {
        handlers.delete(handler)
      }
    } else {
      this.eventHandlers.delete(eventType)
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Convenience methods
  joinConversation(conversationId: string) {
    this.emit("join_conversation", { conversation_id: conversationId })
  }

  sendMessage(conversationId: string, content: string) {
    this.emit("send_message", { conversation_id: conversationId, content })
  }

  markAsRead(messageId: string) {
    this.emit("mark_read", { message_id: messageId })
  }

  startTyping(conversationId: string) {
    this.emit("typing_start", { conversation_id: conversationId })
  }

  stopTyping(conversationId: string) {
    this.emit("typing_stop", { conversation_id: conversationId })
  }
}

// Singleton instance
let chatSocketInstance: ChatSocketManager | null = null

export function getChatSocket(): ChatSocketManager {
  if (!chatSocketInstance) {
    chatSocketInstance = new ChatSocketManager()
  }
  return chatSocketInstance
}

// Made with Bob
