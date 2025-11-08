// app/api/chat/send/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { authCheck } from "@/lib/auth.server";
import PusherServer from "pusher";

// --- CLIENTE DE SUPABASE SERVICE ---
// Se define aquí para ser reutilizado en el historial
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "Faltan variables de entorno de Supabase: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o equivalente)."
  );
}

export const supabaseService: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);
// --- FIN CLIENTE DE SUPABASE SERVICE ---

// --- CONFIGURACIÓN DE PUSHER ---
const pusher = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
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
    if (!user || !user.id) {
      console.error("DEBUG: 🔴 Fallo de autenticación en /api/chat/send.");
      return NextResponse.json(
        { error: "No autorizado o token inválido" },
        { status: 401 }
      );
    }
    const senderId = user.id;

    // 2. RECEPCIÓN DE DATOS
    const { recipientId, propertyId, content } = await req.json();

    if (!recipientId || !propertyId || !content) {
      console.error("DEBUG: 🟡 Datos de entrada incompletos.");
      return NextResponse.json(
        { error: "Faltan recipientId, propertyId o content" },
        { status: 400 }
      );
    }

    // 3. INSERCIÓN EN SUPABASE
    const { data: newMessage, error: dbError } = await supabaseService
      .from("messages")
      .insert([
        {
          sender_id: senderId,
          recipient_id: recipientId,
          property_id: propertyId,
          content: content.trim(),
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
    );

    // 4. NOTIFICACIÓN PUSHER
    const chatRoomId = getChatRoomId(senderId, recipientId, propertyId);

    await pusher.trigger(chatRoomId, "message-sent", newMessage);

    console.log(
      `DEBUG: ✅ Evento 'message-sent' disparado en el canal: ${chatRoomId}`
    );

    // 5. RESPUESTA EXITOSA
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
