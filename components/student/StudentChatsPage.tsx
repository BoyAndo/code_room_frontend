// components/student/StudentChatsPage.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare } from "lucide-react";
import { pusherClient } from "@/lib/pusher.client";

// --- Interfaces y Tipos ---

interface RawConversation {
  studentId: string;
  landlordId: string;
  propertyId: string;
  lastMessageContent: string;
  lastMessageTime: string;
}

interface ResolvedLandlord {
  id: string;
  name: string;
  isVerified?: boolean;
}

interface ResolvedProperty {
  id: string;
  name: string;
}

interface ResolvedData {
  properties: ResolvedProperty[];
  users: ResolvedLandlord[];
}

interface ChatListItem extends RawConversation {
  landlordName: string;
  propertyName: string;
  isVerified?: boolean;
}

interface DBMessage {
  id: number;
  sender_id: number;
  recipient_id: number;
  property_id: number;
  content: string;
  created_at: string;
  sender_role: string;
  recipient_role: string;
}

// Función para resolver nombres de propiedades y arrendadores
const resolveNames = async (
  propertyIds: string[],
  landlordIds: string[]
): Promise<ResolvedData> => {
  try {
    const response = await fetch("/api/data/resolve-names-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyIds, landlordIds }),
    });

    if (!response.ok) {
      console.error("Fallo al resolver nombres:", await response.text());
      return { properties: [], users: [] };
    }
    return response.json();
  } catch (error) {
    console.error("Error de red al resolver nombres:", error);
    return { properties: [], users: [] };
  }
};

// --- Componente Principal ---

const StudentChatsPage: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [conversations, setConversations] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);
  
  // ✅ Estados para el chat (copiados de /search)
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [inputContent, setInputContent] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const response = await fetch(
        `/api/chat/student-chats?studentId=${encodeURIComponent(
          String(currentUserId)
        )}`
      );
      const data = await response.json();

      if (response.ok && Array.isArray(data.conversations)) {
        const initialConversations: RawConversation[] = data.conversations;

        if (initialConversations.length > 0) {
          const propertyIds = Array.from(
            new Set(initialConversations.map((c) => c.propertyId))
          );
          const landlordIds = Array.from(
            new Set(initialConversations.map((c) => c.landlordId))
          );

          const resolvedData = await resolveNames(propertyIds, landlordIds);

          const finalChats = initialConversations.map((chat) => {
            const landlord = resolvedData.users.find(
              (l) => String(l.id) === chat.landlordId
            );
            const property = resolvedData.properties.find(
              (p) => String(p.id) === chat.propertyId
            );

            return {
              ...chat,
              landlordName: landlord?.name || `Arrendador ID ${chat.landlordId}`,
              propertyName: property?.name || `Propiedad ID ${chat.propertyId}`,
              isVerified: landlord?.isVerified ?? false,
            } as ChatListItem;
          });

          setConversations(finalChats);

          setSelectedChat((prevSelectedChat) => {
            if (!prevSelectedChat) return null;
            const updatedChat = finalChats.find(
              (c) =>
                c.propertyId === prevSelectedChat.propertyId &&
                c.landlordId === prevSelectedChat.landlordId
            );
            return updatedChat || null;
          });
        } else {
          setConversations([]);
        }
      } else {
        console.error(
          "Fallo al cargar lista de conversaciones. Respuesta:",
          data
        );
      }
    } catch (error) {
      console.error("Error de red al cargar conversaciones:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // ✅ Cargar historial de mensajes (copiado de /search)
  const fetchChatHistory = useCallback(async (chat: ChatListItem) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(
        `/api/chat/history?landlordId=${chat.landlordId}&propertyId=${chat.propertyId}&studentId=${chat.studentId}`,
        { credentials: "include" }
      );

      if (response.ok) {
        const result = await response.json();
        const messagesArray: DBMessage[] = Array.isArray(result.messages)
          ? result.messages
          : [];
        setMessages(messagesArray);
      } else {
        console.error("Fallo al obtener historial");
        setMessages([]);
      }
    } catch (error) {
      console.error("Error de red al obtener historial:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // ✅ Enviar mensaje (copiado de /search)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = inputContent.trim();
    if (!trimmedContent || !selectedChat) return;

    try {
      await fetch(`/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedChat.landlordId,
          propertyId: selectedChat.propertyId,
          content: trimmedContent,
        }),
        credentials: "include",
      });
      setInputContent("");
    } catch (error) {
      console.error("Fallo al enviar mensaje:", error);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId, fetchConversations]);

  // ✅ Suscripción a Pusher (copiado de /search)
  useEffect(() => {
    if (!selectedChat || !currentUserId || !pusherClient) return;

    const channelParticipants = [selectedChat.landlordId, selectedChat.studentId]
      .sort()
      .join("-");
    const channelName = `private-chat-prop-${selectedChat.propertyId}-${channelParticipants}`;

    console.log("🔔 Suscribiéndose al canal:", channelName);
    const channel = pusherClient.subscribe(channelName);

    const handleNewMessage = (data: DBMessage) => {
      console.log("📨 Nuevo mensaje recibido:", data);
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === data.id)) {
          return prev;
        }
        return [...prev, data];
      });
      
      // ✅ ACTUALIZAR LA LISTA DE CONVERSACIONES
      fetchConversations();
    };

    channel.bind("message-sent", handleNewMessage);

    return () => {
      console.log("🔌 Desuscribiéndose del canal:", channelName);
      channel.unbind("message-sent", handleNewMessage);
      pusherClient.unsubscribe(channelName);
    };
  }, [selectedChat, currentUserId, fetchConversations]);

  // Cargar historial cuando se selecciona un chat
  useEffect(() => {
    if (selectedChat) {
      fetchChatHistory(selectedChat);
    }
  }, [selectedChat, fetchChatHistory]);

  useEffect(() => {
    if (!currentUserId) {
      setSelectedChat(null);
    }
  }, [currentUserId]);

  if (!currentUserId) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: El usuario no está autenticado.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-neutral-600">Cargando chats...</div>
    );
  }

  const totalConversations = conversations.length;

  return (
    <div className="flex h-full min-h-[80vh] bg-neutral-50 rounded-lg shadow-xl overflow-hidden">
      {/* Columna Izquierda: Lista de Chats */}
      <div className="w-1/3 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-neutral-800">
            Mis Conversaciones
          </h2>
          <p className="text-sm text-neutral-500">
            Total de {totalConversations}{" "}
            {totalConversations === 1 ? "conversación" : "conversaciones"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {totalConversations === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
              No tienes conversaciones activas.
            </div>
          ) : (
            conversations.map((chat) => (
              <div
                key={`${chat.propertyId}-${chat.landlordId}`}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 border-b cursor-pointer transition duration-150 ${
                  selectedChat?.propertyId === chat.propertyId &&
                  selectedChat?.landlordId === chat.landlordId
                    ? "bg-golden/10 border-l-4 border-golden"
                    : "hover:bg-neutral-50"
                }`}
              >
                <p className="font-semibold text-neutral-800 truncate">
                  {chat.landlordName}
                </p>
                <p className="text-sm text-neutral-600 truncate mt-0.5">
                  Propiedad: {chat.propertyName}
                </p>
                <p className="text-xs text-neutral-500 truncate mt-1">
                  Último mensaje: {chat.lastMessageContent}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Columna Derecha: Ventana de Chat */}
      <div className="w-2/3 p-4">
        {selectedChat ? (
          <div className="flex flex-col h-full bg-white border rounded-lg shadow-lg">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
                  <p className="ml-3 text-neutral-600">Cargando mensajes...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-neutral-500">
                  <MessageSquare className="h-10 w-10 mb-2" />
                  <p>¡Inicia la conversación!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.sender_role === "STUDENT";
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
                            ? "bg-sage text-white"
                            : "bg-gray-200 text-neutral-800"
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
                })
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 border border-gray-300 p-3 rounded-full focus:ring-sage focus:border-sage"
                  disabled={loadingMessages}
                />
                <button
                  type="submit"
                  className="bg-sage text-white p-3 rounded-full hover:bg-sage/90 disabled:bg-neutral-400 transition duration-150"
                  disabled={loadingMessages || !inputContent.trim()}
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-neutral-500">
            <MessageSquare className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium">Selecciona una Conversación</h3>
            <p className="text-sm">Para ver el historial y responder.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentChatsPage;
