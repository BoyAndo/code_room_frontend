import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { authCheck } from "@/lib/auth.server";
import PusherServer from "pusher";

// --- CLIENTE DE SUPABASE SERVICE ---
// Usamos el Service Role Key, no el anon key.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

// Variable para cachear el cliente
let _supabaseServiceInstance: SupabaseClient | null = null;

// Función lazy para obtener el cliente de Supabase (solo en runtime)
function getSupabaseService(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error(
      "Faltan variables de entorno de Supabase: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o equivalente)."
    );
  }
  
  // Cachear la instancia para no recrearla en cada llamada
  if (!_supabaseServiceInstance) {
    _supabaseServiceInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });
  }
  
  return _supabaseServiceInstance;
}

// Exportamos un getter para compatibilidad con rutas existentes
export const supabaseService = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getSupabaseService()[prop as keyof SupabaseClient];
  }
});
// --- FIN CLIENTE DE SUPABASE SERVICE ---

// --- CONFIGURACIÓN DE PUSHER ---
const pusher = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Función auxiliar para generar el Room ID (debe ser idéntica a la del frontend)
const getChatRoomId = (
  id1: number,
  id2: number,
  propertyId: number
): string => {
  const sortedIds = [id1, id2].sort((a, b) => a - b).join("-");
  return `private-chat-prop-${propertyId}-${sortedIds}`;
};

export async function POST(req: NextRequest) {
  try {
    // 1. AUTENTICACIÓN
    const { user } = await authCheck();
    if (!user || !user.id || !user.role) {
      return NextResponse.json(
        { error: "No autorizado o falta rol" },
        { status: 401 }
      );
    }
    const rawSenderId = user.id; // ✅ CORRECCIÓN CLAVE: Normalizar el rol a MAYÚSCULAS
    const senderRole = (user.role as string).toUpperCase(); // 2. RECEPCIÓN DE DATOS

    const { recipientId, propertyId, content } = await req.json();

    if (!recipientId || !propertyId || !content) {
      console.error("DEBUG: 🟡 Datos de entrada incompletos.");
      return NextResponse.json(
        { error: "Faltan recipientId, propertyId o content" },
        { status: 400 }
      );
    } // 🛑 CONVERSIÓN DE IDs a number para Supabase

    const senderId = Number(rawSenderId);
    const numericRecipientId = Number(recipientId);
    const numericPropertyId = Number(propertyId);

    // 🚨 DETERMINACIÓN DE ROL DEL DESTINATARIO
    let recipientRole: string;
    if (senderRole === "STUDENT") {
      recipientRole = "LANDLORD";
    } else if (senderRole === "LANDLORD") {
      recipientRole = "STUDENT";
    } else {
      // Manejar rol desconocido, lo que causó el error 400 anterior
      console.warn(`DEBUG: Rol de remitente desconocido: ${senderRole}`);
      return NextResponse.json(
        { error: "Rol de remitente no reconocido para chat." },
        { status: 400 }
      );
    } // Verificación básica de conversión

    if (
      isNaN(senderId) ||
      isNaN(numericRecipientId) ||
      isNaN(numericPropertyId)
    ) {
      console.error("DEBUG: ❌ Error de conversión de IDs a números.");
      return NextResponse.json(
        { error: "Los IDs de usuario o propiedad deben ser números válidos." },
        { status: 400 }
      );
    } // 3. INSERCIÓN EN SUPABASE

    const { data: newMessage, error: dbError } = await supabaseService
      .from("messages")
      .insert([
        {
          sender_id: senderId,
          recipient_id: numericRecipientId,
          property_id: numericPropertyId,
          content: content.trim(),
          sender_role: senderRole,
          recipient_role: recipientRole, // ✅ Roles insertados
        },
      ])
      .select("*")
      .single();

    if (dbError) {
      console.error(
        "DEBUG: ❌ ERROR de Supabase al insertar mensaje:",
        dbError.message
      );
      return NextResponse.json(
        {
          error: "Fallo al guardar mensaje en la BD",
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      "DEBUG: ✅ Mensaje guardado correctamente en Supabase. ID:",
      newMessage.id
    ); // 4. NOTIFICACIÓN PUSHER

    const chatRoomId = getChatRoomId(
      senderId,
      numericRecipientId,
      numericPropertyId
    );

    await pusher.trigger(chatRoomId, "message-sent", newMessage);

    console.log(
      `DEBUG: ✅ Evento 'message-sent' disparado en el canal: ${chatRoomId}`
    ); // 5. RESPUESTA EXITOSA

    return NextResponse.json(
      { success: true, message: newMessage },
      { status: 200 }
    );
  } catch (error) {
    console.error("DEBUG: 🛑 Error general en el servidor:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
