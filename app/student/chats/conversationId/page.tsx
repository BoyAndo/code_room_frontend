// app/(student)/chats/[conversationId]/page.tsx
import ChatWindow from "@/components/chats/ChatWindows"; // ✅ El componente reutilizable
import { redirect, notFound } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { Home, ChevronLeft } from "lucide-react";
import Link from "next/link";

// 🛑 Importamos la función de autenticación y el tipo de payload del estudiante
import { authCheck, StudentPayload } from "@/lib/auth.server";

interface ChatPageProps {
  params: {
    conversationId: string; // El ID canónico: [propertyId]-[user1Id]-[user2Id]
  };
}

export default async function ConversationDetailPage({
  params,
}: ChatPageProps) {
  // 1. AUTENTICACIÓN (Servidor) - Usando la función real
  const { user } = await authCheck(); // Usamos authCheck de auth.server.ts

  // Redirigir si no está loggeado o no es estudiante
  // El rol en auth.server.ts es "student" en minúsculas
  if (!user || user.role !== "student") {
    redirect("/login");
  }

  // Garantizamos que el usuario actual es un estudiante
  const studentUser = user as StudentPayload;
  const currentUserId = studentUser.id.toString();
  const studentName = studentUser.studentName; // Obtenemos el nombre por si se necesita

  const { conversationId } = params;

  // 2. DESCOMPOSICIÓN DEL ID CANÓNICO
  const parts = conversationId.split("-");
  if (parts.length !== 3) {
    notFound(); // URL mal formada
  }

  const [propertyId, user1Id, user2Id] = parts;

  // Validar que el usuario actual es uno de los participantes (seguridad)
  if (user1Id !== currentUserId && user2Id !== currentUserId) {
    // Redirigir a una página segura si no es parte de la conversación
    redirect("/search");
  }

  // Identificar los IDs de los participantes
  const landlordId = user1Id === currentUserId ? user2Id : user1Id;
  const studentId = currentUserId;

  // 3. RESOLUCIÓN DE NOMBRES
  let propertyName = `Propiedad #${propertyId}`;
  let landlordName = "Propietario";

  try {
    // 🚨 Ajusta este endpoint si es necesario. Asume que devuelve { propertyName: string, landlordName: string }
    const res = await apiFetch(
      `/api/properties/resolve-chat-details?propertyId=${propertyId}&landlordId=${landlordId}`
    );
    const data = await res.json();

    propertyName = data.propertyName || propertyName;
    landlordName = data.landlordName || "Propietario verificado";
  } catch (e) {
    console.error(
      `Error al resolver detalles de la conversación ${propertyId}:`,
      e
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header del Chat */}
      <header className="p-4 border-b bg-white shadow-md flex items-center">
        <Link
          href="/student/chats"
          className="p-2 mr-3 text-neutral-500 hover:text-sage-600 transition"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-neutral-800 flex items-center">
            <Home className="h-5 w-5 mr-2 text-golden-500" />
            {propertyName}
          </h2>
          <p className="text-sm text-neutral-500">Chat con {landlordName}</p>
        </div>
      </header>

      {/* Ventana de Chat (Cliente) */}
      <main className="flex-grow overflow-hidden">
        <ChatWindow
          currentUserId={currentUserId}
          landlordId={landlordId}
          propertyId={propertyId}
          studentId={studentId}
          // Opcional: pasar nombres si ChatWindow los necesita para la UI
          propertyName={propertyName}
          studentName={studentName}
        />
      </main>
    </div>
  );
}
