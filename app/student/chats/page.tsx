"use client";

import React, { useState, useEffect } from "react";
import { useAuth, isStudent } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api-client";
import { MessageSquare, Heart, Loader2 } from "lucide-react";
import StudentConversationListItem from "@/components/chats/StudentConversationListItem";
import { useRouter } from "next/navigation";

// --- Interfaces de Datos (Consistentes con la API) ---
interface RawConversation {
  conversationId: string;
  studentId: string;
  landlordId: string;
  propertyId: string;
  lastMessageContent: string;
  lastMessageTime: string;
}
interface ResolvedUser {
  id: string;
  name: string;
}
interface ResolvedProperty {
  id: string;
  name: string;
}
interface ChatListItem extends RawConversation {
  landlordName: string;
  propertyName: string;
}

// 💡 LÓGICA DE RESOLUCIÓN DE NOMBRES (CORREGIDA a POST)
const resolveNames = async (
  rawConversations: RawConversation[]
): Promise<{ properties: ResolvedProperty[]; users: ResolvedUser[] }> => {
  if (rawConversations.length === 0) {
    return { properties: [], users: [] };
  }

  // 1. Obtener todos los Landlord IDs y Property IDs únicos
  const uniqueLandlordIds = Array.from(
    new Set(rawConversations.map((c) => c.landlordId))
  );
  const uniquePropertyIds = Array.from(
    new Set(rawConversations.map((c) => c.propertyId))
  );

  try {
    // ✅ CORRECCIÓN CRÍTICA: Usar un endpoint POST genérico para la resolución
    const response = await apiFetch("/api/data/resolve-names", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Enviamos ambos sets de IDs en el cuerpo de la solicitud
      body: JSON.stringify({
        propertyIds: uniquePropertyIds,
        landlordIds: uniqueLandlordIds,
      }),
    });

    if (!response.ok) {
      console.error("Fallo al resolver nombres:", await response.text());
      return { properties: [], users: [] };
    }

    // Asumimos que la respuesta tiene la forma { properties: [], users: [] }
    const { properties, users } = await response.json();

    // Se asegura de que los datos sean arrays
    return {
      properties: Array.isArray(properties) ? properties : [],
      users: Array.isArray(users) ? users : [],
    };
  } catch (error) {
    console.error("Error de red al resolver nombres:", error);
    return { properties: [], users: [] };
  }
};

export default function StudentChatsListPage() {
  // ✅ TIPADO: Usamos una interfaz o tipo más seguro si es posible, o asumimos la estructura
  const { auth, isAuthenticated, isAuthLoading } = useAuth() as any; // Asumiendo que useAuth provee isAuthLoading
  const router = useRouter();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = auth?.user?.id?.toString() || null;

  useEffect(() => {
    // 🛑 Manejo de Autenticación y Redirección
    if (isAuthLoading) {
      // Esperar a que la autenticación termine de cargar.
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login"); // ✅ CORREGIDO: Redirige a login si no está autenticado
      return;
    }

    if (!auth?.user || !isStudent(auth.user)) {
      // Si está loggeado pero no es estudiante, lo enviamos a su dashboard o a una página de acceso denegado
      router.replace("/"); // ✅ CORREGIDO: Redirige a la página principal o dashboard (ajusta según tu estructura)
      return;
    }

    if (!currentUserId) {
      // Si está autenticado como estudiante pero el ID no está disponible (caso borde)
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. LLAMADA A LA RUTA DE CHATS
        const response = await apiFetch(
          `/api/student-chats?studentId=${currentUserId}`
        );

        if (!response.ok) {
          throw new Error("Fallo al cargar las conversaciones");
        }

        const { conversations: rawConversations } = await response.json();

        // 2. RESOLVER NOMBRES con la función CORREGIDA (POST)
        const { properties, users: landlords } = await resolveNames(
          rawConversations
        );

        const propertyMap = new Map(properties.map((p) => [p.id, p.name]));
        const landlordMap = new Map(landlords.map((u) => [u.id, u.name]));

        // 3. MAPEAR a la interfaz final con nombres
        const resolvedChats: ChatListItem[] = rawConversations.map(
          (chat: RawConversation) => ({
            ...chat,
            landlordName:
              landlordMap.get(chat.landlordId) || "Propietario Desconocido",
            propertyName:
              propertyMap.get(chat.propertyId) || "Propiedad Desconocida",
          })
        );

        // 4. Ordenar por último mensaje (más reciente primero)
        resolvedChats.sort(
          (a, b) =>
            new Date(b.lastMessageTime).getTime() -
            new Date(a.lastMessageTime).getTime()
        );

        setChats(resolvedChats);
      } catch (err) {
        console.error("Error cargando chats del estudiante:", err);
        setError(
          "No se pudo cargar el historial de conversaciones. Inténtalo de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUserId, auth?.user?.role, isAuthenticated, isAuthLoading, router]); // Se agregó isAuthLoading a las dependencias

  // ----------------------------------------------------
  // UX: UI de carga, error y lista vacía (Mantener el código original)
  // ----------------------------------------------------
  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
        <p className="ml-3 text-neutral-600">
          Cargando tu sesión y conversaciones...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center max-w-4xl">
        <div className="p-8 bg-red-50 border border-red-300 rounded-lg text-red-600">
          <p>Error al cargar el historial: {error}</p>
        </div>
      </div>
    );
  }

  // Si pasa la autenticación pero currentUserId es null (caso borde)
  if (!currentUserId || !isStudent(auth?.user)) {
    // Esto ya debería estar cubierto por las redirecciones, pero es un fallback de seguridad.
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-8 text-sage-700 border-b pb-4">
          <MessageSquare className="inline h-8 w-8 mr-3 text-golden-500" />
          Tus Conversaciones con Propietarios
        </h1>

        {chats.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-lg">
            <Heart className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-neutral-600">
              Aún no tienes mensajes
            </h3>
            <p className="text-neutral-500 mt-2 text-center">
              Para iniciar un chat, busca una propiedad y usa el botón "Chatear
              con Propietario".
            </p>
            <button
              onClick={() => router.push("/search")}
              className="mt-6 bg-sage-600 text-white px-6 py-2 rounded-lg hover:bg-sage-700 transition"
            >
              Buscar Propiedades
            </button>
          </div>
        )}

        <div className="space-y-4">
          {chats.map((chat) => (
            <StudentConversationListItem
              key={chat.conversationId}
              chat={chat}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
