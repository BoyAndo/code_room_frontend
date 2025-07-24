"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Send, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  property: {
    id: number
    title: string
    city: string
    price: number
    author: {
      name: string
      verified: boolean
      avatar: string
      responseTime: string
    }
  } | null
}

export function ChatModal({ isOpen, onClose, property }: ChatModalProps) {
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<any[]>([])

  const handleSendMessage = () => {
    if (chatMessage.trim() && property) {
      const newMessage = {
        id: Date.now(),
        text: chatMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
      }
      setChatMessages([...chatMessages, newMessage])
      setChatMessage("")

      // Simular respuesta automática del propietario
      setTimeout(() => {
        const autoReply = {
          id: Date.now() + 1,
          text: "¡Hola! Gracias por tu interés en la propiedad. ¿Te gustaría agendar una visita?",
          sender: "owner",
          timestamp: new Date().toLocaleTimeString(),
        }
        setChatMessages((prev) => [...prev, autoReply])
      }, 2000)
    }
  }

  if (!property) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Image
              src={property.author.avatar || "/placeholder.svg"}
              alt={property.author.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <div className="flex items-center space-x-1">
                <span>{property.author.name}</span>
                {property.author.verified ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <span className="text-sm text-neutral-500 font-normal">
                {property.author.verified ? "Propietario verificado" : "Propietario no verificado"}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Property Info */}
          <div className="bg-cream/20 p-3 rounded-lg">
            <h4 className="font-medium text-neutral-800">{property.title}</h4>
            <p className="text-sm text-neutral-600">
              {property.city} • ${property.price}/mes
            </p>
          </div>

          {/* Chat Messages */}
          <div className="h-64 overflow-y-auto space-y-2 border rounded-lg p-3 bg-neutral-50">
            {chatMessages.length === 0 ? (
              <div className="text-center text-neutral-500 text-sm py-8">
                Inicia la conversación con {property.author.name}
              </div>
            ) : (
              chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-2 rounded-lg text-sm ${
                      message.sender === "user" ? "bg-sage text-white" : "bg-white border border-sage/20"
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className="text-xs opacity-70">{message.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <Textarea
              placeholder="Escribe tu mensaje..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 min-h-[40px] max-h-[80px] border-sage/30 focus:border-sage focus:ring-sage/20"
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!chatMessage.trim()}
              className="bg-sage hover:bg-sage/90 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-neutral-500 text-center">{property.author.responseTime}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
