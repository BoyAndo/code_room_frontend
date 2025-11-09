"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { pusherClient } from "@/lib/pusher.client";
import { MessageSquareText } from "lucide-react";

// La estructura del mensaje que esperamos de la base de datos
interface DBMessage {
  id: number;
  sender_id: number;
  recipient_id: number;
  property_id: number;
  content: string;
  created_at: string;
  sender_role: string; // ✅ CRÍTICO: Usado para renderizar el lado correcto
  recipient_role: string;
}

interface ChatWindowProps {
  currentUserId: string; // ID del usuario loggeado
  landlordId: string; // ID del Arrendador en esta conversación
  propertyId: string; // ID de la Propiedad
  studentId: string; // ID del Estudiante en esta conversación
  studentName?: string;
  propertyName?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUserId,
  landlordId,
  propertyId,
  studentId,
}) => {
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [inputContent, setInputContent] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ DETERMINAMOS EL ROL DEL USUARIO LOGUEADO EN ESTA CONVERSACIÓN
  const isCurrentUserLandlord = String(currentUserId) === landlordId;

  // Generación del nombre del canal Pusher (ordenado para consistencia)
  const channelParticipants = [String(landlordId), String(studentId)]
    .sort()
    .join("-");
  const conversationChannelName = `private-chat-prop-${propertyId}-${channelParticipants}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/chat/history?landlordId=${landlordId}&propertyId=${propertyId}&studentId=${studentId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();
        const messagesArray: DBMessage[] = Array.isArray(result.messages)
          ? result.messages
          : [];

        setMessages(messagesArray);
        console.log(
          `DEBUG: ✅ Historial cargado. Total mensajes: ${messagesArray.length}`
        );
      } else {
        const errorText = await response.text();
        console.error(
          `Fallo al obtener historial (Status: ${response.status}):`,
          errorText
        );
        setMessages([]);
      }
    } catch (error) {
      console.error("Error de red al obtener historial:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [landlordId, propertyId, studentId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = inputContent.trim();
    if (!trimmedContent) return;

    // Determinar el destinatario
    const recipientId = isCurrentUserLandlord ? studentId : landlordId;

    try {
      await fetch(`/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: recipientId,
          propertyId: propertyId,
          content: trimmedContent,
        }),
        credentials: "include",
      });
      setInputContent("");
    } catch (error) {
      console.error("Fallo al enviar mensaje:", error);
    }
  };

  // 1. Efecto para Cargar Historial y Conexión a Pusher
  useEffect(() => {
    fetchHistory();

    if (!pusherClient || typeof pusherClient.subscribe !== "function") {
      console.warn(
        "pusherClient no disponible: omitiendo suscripción WebSocket"
      );
      return;
    }

    const channel = pusherClient.subscribe(conversationChannelName);

    // Bindeamos el evento 'message-sent' que dispara el backend
    channel.bind("message-sent", (data: DBMessage) => {
      console.log("Mensaje recibido por WebSocket:", data);

      setMessages((prevMessages) => {
        if (!Array.isArray(prevMessages)) return [data];

        // Evitar duplicados
        if (!prevMessages.some((msg) => msg.id === data.id)) {
          return [...prevMessages, data];
        }
        return prevMessages;
      });
    });

    // Función de limpieza para desuscribirse de Pusher al desmontar
    return () => {
      try {
        channel.unbind_all();
        pusherClient.unsubscribe(conversationChannelName);
      } catch (err) {
        console.warn("Error during Pusher cleanup:", err);
      }
    };
  }, [conversationChannelName, fetchHistory]);

  // 2. Efecto para Desplazamiento (Scroll)
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
        <p className="ml-3 text-neutral-600">Cargando mensajes...</p>
      </div>
    );
  }

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-neutral-500">
        <MessageSquareText className="h-10 w-10 mb-2" />
        <p>¡Inicia la conversación!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          // ✅ CORRECCIÓN: Usamos el rol para determinar si es mensaje propio o recibido.
          const isOwnMessage =
            (isCurrentUserLandlord && msg.sender_role === "LANDLORD") ||
            (!isCurrentUserLandlord && msg.sender_role === "STUDENT");

          return (
            <div
              key={msg.id}
              className={`flex ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 max-w-xs rounded-lg shadow-md ${
                  isOwnMessage
                    ? "bg-sage text-white" // Mensaje Propio (Derecha)
                    : "bg-gray-200 text-neutral-800" // ✅ Mensaje Recibido (Izquierda, color visible)
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <span className="text-xs opacity-75 mt-1 block text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border border-gray-300 p-3 rounded-full focus:ring-sage focus:border-sage"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-sage text-white p-3 rounded-full hover:bg-sage/90 disabled:bg-neutral-400 transition duration-150"
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
