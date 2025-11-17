// components/student/StudentChatsPage.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ChatWindow from "@/components/chat/ChatWindows";
import { MessageSquare } from "lucide-react";

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
  users: ResolvedLandlord[]; // El API devuelve 'users' que contiene los landlords
}

interface ChatListItem extends RawConversation {
  landlordName: string;
  propertyName: string;
  isVerified?: boolean;
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

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId, fetchConversations]);

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
          <ChatWindow
            currentUserId={currentUserId}
            landlordId={selectedChat.landlordId}
            propertyId={selectedChat.propertyId}
            studentId={selectedChat.studentId}
          />
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
