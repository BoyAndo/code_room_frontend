// components/ChatWindow.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
// 🛑 CORRECCIÓN: Usamos el cliente global importado desde /lib/pusher.client
import { pusherClient } from "@/lib/pusher.client";

// ...existing code...
interface Message {
  id: number;
  senderId: string;
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  currentUserId: string;
  landlordId: string;
  propertyId: string;
}
// ------------------

const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUserId,
  landlordId,
  propertyId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channelId = [currentUserId, landlordId].sort().join("-");
  const conversationChannelName = `chat-propiedad-${propertyId}-${channelId}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/chat/history?landlordId=${landlordId}&propertyId=${propertyId}`
      );

      if (response.ok) {
        const data: Message[] = await response.json();
        setMessages(data);
      } else {
        console.error("Fallo al obtener historial:", await response.text());
      }
    } catch (error) {
      console.error("Error de red al obtener historial:", error);
    } finally {
      setLoading(false);
    }
  }, [landlordId, propertyId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    try {
      await fetch(`/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: landlordId,
          propertyId: propertyId,
          content: inputContent,
        }),
        credentials: "include",
      });
      setInputContent("");
    } catch (error) {
      console.error("Fallo al enviar mensaje:", error);
    }
  };

  useEffect(() => {
    fetchHistory();

    // Protección por si pusherClient no está disponible en entorno actual
    if (!pusherClient || typeof pusherClient.subscribe !== "function") {
      console.warn(
        "pusherClient no disponible: omitiendo suscripción WebSocket"
      );
      return;
    }

    const channel = pusherClient.subscribe(conversationChannelName);

    channel.bind("new-message", (data: Message) => {
      console.log("Mensaje recibido por WebSocket:", data);

      setMessages((prevMessages) => {
        if (!prevMessages.some((msg) => msg.id === data.id)) {
          return [...prevMessages, data];
        }
        return prevMessages;
      });
    });

    return () => {
      try {
        channel.unbind_all();
        pusherClient.unsubscribe(conversationChannelName);
      } catch (err) {
        // Evitar errores en limpieza si el canal ya no existe
        console.warn("Error during Pusher cleanup:", err);
      }
    };
  }, [conversationChannelName, fetchHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return <div>Cargando mensajes...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white border rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === currentUserId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 max-w-xs rounded-lg shadow-md ${
                msg.senderId === currentUserId
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs opacity-75 mt-1 block text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border border-gray-300 p-3 rounded-full focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 disabled:bg-gray-400 transition duration-150"
            disabled={loading || !inputContent.trim()}
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
