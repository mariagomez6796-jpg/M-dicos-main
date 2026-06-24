"use client"

import { useEffect, useState, useRef } from "react"
import { useChat } from "@/contexts/chat-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Send,
  MessageCircle,
  Clock,
  CheckCheck,
  AlertCircle,
  Calendar,
  User,
  ArrowLeft,
  Star,
  Phone,
  Mail,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Conversation, Message } from "@/lib/chat-socket"

export function DoctorChat() {
  const {
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
  } = useChat()

  const [messageInput, setMessageInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showPatientInfo, setShowPatientInfo] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending) return

    setIsSending(true)
    try {
      await sendMessage(messageInput)
      setMessageInput("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getPatientName = (conversation: Conversation): string => {
    const patient = conversation.participants.find((p) => p.user_type === "patient")
    return patient?.name || "Paciente"
  }

  const getPatientInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const isConversationExpired = (conversation: Conversation): boolean => {
    return conversation.status === "expired" || new Date(conversation.expires_at) < new Date()
  }

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return format(date, "HH:mm", { locale: es })
    } else if (diffInHours < 48) {
      return "Ayer " + format(date, "HH:mm", { locale: es })
    } else {
      return format(date, "dd/MM/yyyy HH:mm", { locale: es })
    }
  }

  const formatExpirationDate = (expiresAt: string): string => {
    const date = new Date(expiresAt)
    const now = new Date()
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays < 0) {
      return "Expirada"
    } else if (diffInDays === 0) {
      return "Expira hoy"
    } else if (diffInDays === 1) {
      return "Expira mañana"
    } else if (diffInDays <= 7) {
      return `Expira en ${diffInDays} días`
    } else {
      return format(date, "dd/MM/yyyy", { locale: es })
    }
  }

  // Mobile view: show conversation list or chat
  const [showConversationList, setShowConversationList] = useState(true)

  const handleSelectConversation = async (conversationId: string) => {
    await selectConversation(conversationId)
    setShowConversationList(false)
    setShowPatientInfo(false)
  }

  const handleBackToList = () => {
    setShowConversationList(true)
    setShowPatientInfo(false)
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-4">
      {/* Conversation List - Desktop always visible, Mobile conditional */}
      <Card
        className={cn(
          "w-full md:w-80 flex-shrink-0",
          !showConversationList && "hidden md:flex md:flex-col"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Pacientes
            </CardTitle>
            {isConnected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                En línea
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-1.5" />
                Desconectado
              </Badge>
            )}
          </div>
        </CardHeader>
        <Separator />
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {isLoading && conversations.length === 0 ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No tienes conversaciones activas</p>
                <p className="text-xs mt-1">Las conversaciones aparecerán cuando tengas citas programadas</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const patientName = getPatientName(conversation)
                const isExpired = isConversationExpired(conversation)
                const isActive = activeConversation?.conversation_id === conversation.conversation_id

                return (
                  <button
                    key={conversation.conversation_id}
                    onClick={() => handleSelectConversation(conversation.conversation_id)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-colors hover:bg-accent",
                      isActive && "bg-accent"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {getPatientInitials(patientName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate">{patientName}</p>
                          {conversation.last_message_at && (
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(conversation.last_message_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.last_message || "Sin mensajes"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Cita #{conversation.appointment_id}
                          </Badge>
                          {isExpired && (
                            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                              <Clock className="w-3 h-3 mr-1" />
                              Expirada
                            </Badge>
                          )}
                          {conversation.unread_count && conversation.unread_count > 0 && (
                            <Badge variant="default" className="text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area - Desktop always visible, Mobile conditional */}
      <Card
        className={cn(
          "flex-1 flex flex-col",
          showConversationList && "hidden md:flex"
        )}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getPatientInitials(getPatientName(activeConversation))}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{getPatientName(activeConversation)}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Cita #{activeConversation.appointment_id}</span>
                    <Separator orientation="vertical" className="h-3" />
                    <Clock className="w-3 h-3" />
                    <span>{formatExpirationDate(activeConversation.expires_at)}</span>
                    {isConversationExpired(activeConversation) && (
                      <>
                        <Separator orientation="vertical" className="h-3" />
                        <span className="text-orange-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Solo lectura
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPatientInfo(!showPatientInfo)}
                  className="hidden md:flex"
                >
                  <User className="w-4 h-4 mr-2" />
                  Info del Paciente
                </Button>
              </div>
            </CardHeader>
            <Separator />

            <div className="flex-1 flex overflow-hidden">
              {/* Messages Area */}
              <div className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_type === "doctor"
                      const isSystem = message.message_type === "system"

                      if (isSystem) {
                        return (
                          <div key={message.message_id} className="flex justify-center">
                            <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                              {message.content}
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div
                          key={message.message_id}
                          className={cn("flex gap-2", isOwn && "flex-row-reverse")}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback
                              className={cn(
                                isOwn ? "bg-primary text-primary-foreground" : "bg-blue-100 text-blue-700"
                              )}
                            >
                              {isOwn ? "Dr" : getPatientInitials(getPatientName(activeConversation)).slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn("flex flex-col gap-1", isOwn && "items-end")}>
                            <div
                              className={cn(
                                "px-3 py-2 rounded-lg max-w-[70%] break-words",
                                isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                              )}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>{formatMessageTime(message.created_at)}</span>
                              {isOwn && <CheckCheck className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Typing Indicator */}
                    {typingUsers.size > 0 && (
                      <div className="flex gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {getPatientInitials(getPatientName(activeConversation)).slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted px-3 py-2 rounded-lg">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  {isConversationExpired(activeConversation) ? (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Esta conversación ha expirado y es de solo lectura</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe un mensaje al paciente..."
                        disabled={isSending || !isConnected}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || isSending || !isConnected}
                        size="icon"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Patient Info Sidebar - Desktop only */}
              {showPatientInfo && (
                <div className="hidden md:block w-64 border-l bg-muted/30">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      <div className="text-center">
                        <Avatar className="w-20 h-20 mx-auto mb-3">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                            {getPatientInitials(getPatientName(activeConversation))}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold text-lg">{getPatientName(activeConversation)}</h3>
                        <p className="text-sm text-muted-foreground">Paciente</p>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Cita</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>#{activeConversation.appointment_id}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Estado de Conversación</p>
                          <Badge
                            variant={isConversationExpired(activeConversation) ? "secondary" : "default"}
                            className="text-xs"
                          >
                            {isConversationExpired(activeConversation) ? "Expirada" : "Activa"}
                          </Badge>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Expira</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{formatExpirationDate(activeConversation.expires_at)}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Mensajes</p>
                          <div className="flex items-center gap-2 text-sm">
                            <MessageCircle className="w-4 h-4 text-muted-foreground" />
                            <span>{activeConversation.message_count || messages.length} mensajes</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Acciones Rápidas</p>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Phone className="w-4 h-4 mr-2" />
                          Llamar
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Mail className="w-4 h-4 mr-2" />
                          Enviar Email
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Star className="w-4 h-4 mr-2" />
                          Ver Historial
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </>
        ) : (
          // No conversation selected
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-muted-foreground max-w-sm">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Selecciona un paciente</h3>
              <p className="text-sm">
                Elige una conversación de la lista para comenzar a chatear con tu paciente
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// Made with Bob
