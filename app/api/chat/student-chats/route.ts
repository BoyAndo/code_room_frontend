import { NextRequest, NextResponse } from "next/server";
import { authCheck } from "@/lib/auth.server"; // Asume tu función de autenticación
import { supabaseService } from "../send/route"; // Cliente Supabase con Service Role Key

// 🛑 SOLUCIÓN AL ERROR DE TIPADO: Definición de la estructura del usuario
// Nota: Si ya tienes estos tipos definidos en otro archivo (ej. @/types/auth.ts),
// puedes reemplazar estas definiciones con un 'import' desde ese archivo.
type UserRole = "STUDENT" | "LANDLORD" | "ADMIN";

interface AuthUser {
  id: string;
  role: UserRole;
  // Otros campos necesarios (email, name, etc.)
}

interface AuthResult {
  isAuthenticated: boolean;
  user: AuthUser | null;
}
// ----------------------------------------------------------------------

// --- Interfaces para Tipado ---
interface Message {
  sender_id: number;
  recipient_id: number;
  property_id: number;
  content: string;
  created_at: string;
  sender_role: string;
  recipient_role: string;
}

interface Conversation {
  conversationId: string;
  studentId: string;
  landlordId: string;
  propertyId: string;
  lastMessageContent: string;
  lastMessageTime: string;
}

/**
 * GET /api/student-chats
 * Obtiene la lista de conversaciones del estudiante loggeado, agrupadas por Landlord y Propiedad.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. AUTENTICACIÓN: Verificar que el usuario sea un estudiante
    // 💡 NOTA: authCheck debe estar tipado para devolver Promise<AuthResult>
    const authResult = (await authCheck()) as AuthResult;
    const user = authResult.user;

    // Con la interfaz AuthUser definida, 'user.role' y 'user.id' ya no marcarán error.
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "No autorizado o rol incorrecto." },
        { status: 401 }
      );
    }
    const studentIdString = user.id; // ✅ user.id está disponible
    const studentIdNumber = Number(studentIdString);

    // 2. CONSULTA EN SUPABASE: Obtener todos los mensajes donde el usuario actual sea emisor O receptor
    const { data: messages, error: dbError } = await supabaseService
      .from("messages")
      .select("*, sender_role, recipient_role")
      .or(`sender_id.eq.${studentIdNumber},recipient_id.eq.${studentIdNumber}`)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("DEBUG: ❌ ERROR de Supabase:", dbError.message);
      return NextResponse.json(
        { error: "Fallo al obtener conversaciones", details: dbError.message },
        { status: 500 }
      );
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ conversations: [] }, { status: 200 });
    }

    // 3. AGRUPACIÓN: Encontrar el último mensaje para cada Landlord+Propiedad única
    const conversationsMap = new Map<string, Conversation>();

    (messages as Message[]).forEach((msg) => {
      const messageIsFromStudent = msg.sender_id === studentIdNumber;

      // El ID del Propietario (landlord) es el otro participante
      const landlordId = messageIsFromStudent
        ? msg.recipient_id
        : msg.sender_id;

      // 3a. Crear la clave única de agrupación (Landlord-Propiedad)
      const key = `${String(landlordId)}-${String(msg.property_id)}`;

      // Solo procesamos si es el mensaje más reciente para esta clave
      if (!conversationsMap.has(key)) {
        // Generamos el conversationId canónico (ordenando los IDs de usuario)
        const participants = [String(landlordId), studentIdString].sort();
        const conversationId = `${String(msg.property_id)}-${participants[0]}-${
          participants[1]
        }`;

        conversationsMap.set(key, {
          conversationId: conversationId,
          studentId: studentIdString,
          landlordId: String(landlordId),
          propertyId: String(msg.property_id),
          lastMessageContent: msg.content,
          lastMessageTime: msg.created_at,
        });
      }
    });

    const conversations = Array.from(conversationsMap.values());

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error("Error en /api/student-chats:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
