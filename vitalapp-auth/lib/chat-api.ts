import { apiRequest } from "./api"
import { authService } from "./auth"
import type { Conversation, Message } from "./chat-socket"

const CHAT_API_BASE = process.env.NEXT_PUBLIC_CHAT_API_URL || "http://localhost:8004"

export interface ConversationListResponse {
  conversations: Conversation[]
  total: number
  page: number
  limit: number
}

export interface MessagesResponse {
  messages: Message[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface CreateConversationRequest {
  appointment_id: number
}

export interface SendMessageRequest {
  conversation_id: string
  content: string
}

export interface RatingRequest {
  appointment_id: number
  rating: number
  comment?: string
}

export const chatApi = {
  // Conversations
  getConversations: async (page: number = 1, limit: number = 20): Promise<ConversationListResponse> => {
    const user = authService.getCurrentUser()
    if (!user?.token) throw new Error("No authentication token")

    const response = await fetch(
      `${CHAT_API_BASE}/api/v1/conversations?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`)
    }

    return response.json()
  },

  getConversation: async (conversationId: string): Promise<Conversation> => {
    const user = authService.getCurrentUser()
    if (!user?.token) throw new Error("No authentication token")

    const response = await fetch(`${CHAT_API_BASE}/api/v1/conversations/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`)
    }

    return response.json()
  },

  createConversation: async (appointmentId: number): Promise<Conversation> => {
    const user = authService.getCurrentUser()
    if (!user?.token) throw new Error("No authentication token")

    const response = await fetch(`${CHAT_API_BASE}/api/v1/conversations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ appointment_id: appointmentId }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`)
    }

    return response.json()
  },

  // Messages
  getMessages: async (
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<MessagesResponse> => {
    const user = authService.getCurrentUser()
    if (!user?.token) throw new Error("No authentication token")

    const response = await fetch(
      `${CHAT_API_BASE}/api/v1/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`)
    }

    return response.json()
  },

  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const user = authService.getCurrentUser()
    if (!user?.token) throw new Error("No authentication token")

    const response = await fetch(`${CHAT_API_BASE}/api/v1/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation_id: conversationId, content }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`)
    }

    return response.json()
  },

  markAsRead: async (messageId: string): Promise<void> => {
    const user = authService.getCurrentUser()
    if (!user?.token) throw new Error("No authentication token")

    const response = await fetch(`${CHAT_API_BASE}/api/v1/messages/${messageId}/read`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to mark message as read: ${response.statusText}`)
    }
  },

  // Ratings
  submitRating: async (appointmentId: number, rating: number, comment?: string): Promise<void> => {
    const user = authService.getCurrentUser()
    if (!user?.token) throw new Error("No authentication token")

    const response = await fetch(`${CHAT_API_BASE}/api/v1/ratings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ appointment_id: appointmentId, rating, comment }),
    })

    if (!response.ok) {
      throw new Error(`Failed to submit rating: ${response.statusText}`)
    }
  },

  getRating: async (appointmentId: number): Promise<any> => {
    const user = authService.getCurrentUser()
    if (!user?.token) throw new Error("No authentication token")

    const response = await fetch(`${CHAT_API_BASE}/api/v1/ratings/appointment/${appointmentId}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to fetch rating: ${response.statusText}`)
    }

    return response.json()
  },
}

// Made with Bob
