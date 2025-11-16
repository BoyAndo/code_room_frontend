// components/landlord/LandlordChatsPage.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
// 💡 ASUME que tienes tu hook de autenticación
import { useAuth } from "@/contexts/AuthContext";
// 💡 ASUME que tienes tu componente de chat
// El archivo real se llama ChatWindows.tsx y exporta por defecto ChatWindow
import ChatWindow from "@/components/chats/ChatWindows";
import { MessageSquare, CheckCircle, XCircle } from "lucide-react";

// --- Interfaces y Tipos (Para consistencia de datos) ---

interface RawConversation {
  studentId: string;
  landlordId: string;
  propertyId: string;
  lastMessageContent: string;
  lastMessageTime: string;
}

interface ResolvedUser {
  id: string;
  name: string;
  college?: string; // Nuevo: Nombre de la universidad
  isVerified?: boolean; // Nuevo: Estado de verificación
}

interface ResolvedProperty {
  id: string;
  name: string; // Título de la propiedad
}

interface ResolvedData {
  properties: ResolvedProperty[];
  users: ResolvedUser[];
}

interface ChatListItem extends RawConversation {
  studentName: string;
  propertyName: string;
  college?: string;
  isVerified?: boolean;
}

// 💡 Función de utilidad para resolver nombres a través del proxy de Next.js
const resolveNames = async (
  propertyIds: string[],
  studentIds: string[]
): Promise<ResolvedData> => {
  try {
    // Llama al endpoint POST corregido
    const response = await fetch("/api/data/resolve-names", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyIds, studentIds }),
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

const LandlordChatsPage: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user?.id; // ID del Arrendador loggeado (de Supabase)

  const [conversations, setConversations] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;

    try {
      // 1. Fetch de IDs de conversaciones (Llama al endpoint GET corregido)
      const response = await fetch(
        `/api/chat/landlord-chats?landlordId=${encodeURIComponent(
          String(currentUserId)
        )}`
      );
      const data = await response.json();

      if (response.ok && Array.isArray(data.conversations)) {
        const initialConversations: RawConversation[] = data.conversations;

        if (initialConversations.length > 0) {
          // 2. Extraer IDs únicos
          const propertyIds = Array.from(
            new Set(initialConversations.map((c) => c.propertyId))
          );
          const studentIds = Array.from(
            new Set(initialConversations.map((c) => c.studentId))
          );

          // 3. Resolver Nombres, Universidad y Verificación (Llama al backend 3001 vía proxy)
          const resolvedData = await resolveNames(propertyIds, studentIds);

          // 4. Mapear y combinar los datos
          const finalChats = initialConversations.map((chat) => {
            // Buscar la información resuelta del estudiante y propiedad
            const student = resolvedData.users.find(
              (u) => String(u.id) === chat.studentId
            );
            const property = resolvedData.properties.find(
              (p) => String(p.id) === chat.propertyId
            );

            return {
              ...chat,
              studentName: student?.name || `Estudiante ID ${chat.studentId}`,
              propertyName: property?.name || `Propiedad ID ${chat.propertyId}`,
              college: student?.college, // Incluimos la universidad
              isVerified: student?.isVerified ?? false, // Incluimos el estado de verificación
            } as ChatListItem;
          });

          setConversations(finalChats);

          // Si había un chat seleccionado, actualizar sus datos con los resueltos
          // Usamos la forma funcional para evitar depender de selectedChat en el useCallback
          setSelectedChat((prevSelectedChat) => {
            if (!prevSelectedChat) return null;
            const updatedChat = finalChats.find(
              (c) =>
                c.propertyId === prevSelectedChat.propertyId &&
                c.studentId === prevSelectedChat.studentId
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

  // Limpiar el chat seleccionado si el usuario se desloggea
  useEffect(() => {
    if (!currentUserId) {
      setSelectedChat(null);
    }
  }, [currentUserId]);

  // Estilos de carga y no autenticado
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
            Chats de Propiedades
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
                key={`${chat.propertyId}-${chat.studentId}`}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 border-b cursor-pointer transition duration-150 ${
                  selectedChat?.propertyId === chat.propertyId &&
                  selectedChat?.studentId === chat.studentId
                    ? "bg-sage/10 border-l-4 border-sage" // Chat seleccionado
                    : "hover:bg-neutral-50" // Chat no seleccionado
                }`}
              >
                {/* ✅ AHORA USAMOS LOS NOMBRES Y DATOS REALES DE MYSQL/PRISMA */}
                <p className="font-semibold text-neutral-800 truncate flex items-center">
                  Estudiante: {chat.studentName}
                  {/* Icono de Verificación */}
                  <span className="ml-2 text-xs font-normal">
                    {chat.isVerified ? (
                      <CheckCircle
                        className="h-4 w-4 inline text-green-500"
                        aria-label="Estudiante Verificado"
                        role="img"
                      />
                    ) : (
                        <XCircle
                          className="h-4 w-4 inline text-red-500"
                          aria-label="Estudiante No Verificado"
                          role="img"
                        />
                    )}
                  </span>
                </p>
                <p className="text-sm text-neutral-600 truncate mt-0.5">
                  Propiedad: {chat.propertyName}
                </p>
                {/* Mostramos la universidad */}
                {chat.college && (
                  <p className="text-xs text-blue-600/80 truncate mt-0.5">
                    Estudia en: {chat.college}
                  </p>
                )}
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
            studentId={selectedChat.studentId} // 💡 CRÍTICO: Pasamos el studentId
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

export default LandlordChatsPage;
