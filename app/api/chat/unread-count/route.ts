import { NextRequest, NextResponse } from "next/server";
import { authCheck } from "@/lib/auth.server";
import { supabaseService } from "../send/route";

/**
 * GET /api/chat/unread-count
 * Cuenta los mensajes no leídos para el usuario actual (landlord)
 *
 * Para simplificar, contamos todos los mensajes donde:
 * - recipient_id = currentUserId (el landlord es el destinatario)
 * - created_at > última vez que el landlord abrió el chat
 *
 * Por ahora, simplemente contamos mensajes recientes como proxy de "no leídos"
 */
export async function GET(req: NextRequest) {
  try {
    // 1. AUTENTICACIÓN
    const { user } = await authCheck();
    if (!user || !user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentUserId = Number(user.id);

    if (isNaN(currentUserId)) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // 2. CONTAR CONVERSACIONES CON MENSAJES RECIENTES
    // Obtenemos el último mensaje de cada conversación donde el landlord es destinatario
    const { data: conversations, error: dbError } = await supabaseService
      .from("messages")
      .select("property_id, sender_id, created_at")
      .eq("recipient_id", currentUserId)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("❌ Error al contar mensajes no leídos:", dbError);
      return NextResponse.json(
        { error: "Error al obtener mensajes" },
        { status: 500 }
      );
    }

    // Agrupar por conversación única (property_id + sender_id)
    const uniqueConversations = new Map<string, Date>();

    conversations?.forEach((msg) => {
      const key = `${msg.property_id}-${msg.sender_id}`;
      const existingDate = uniqueConversations.get(key);
      const msgDate = new Date(msg.created_at);

      if (!existingDate || msgDate > existingDate) {
        uniqueConversations.set(key, msgDate);
      }
    });

    // Por simplicidad, contamos el número de conversaciones únicas con mensajes
    const unreadCount = uniqueConversations.size;

    console.log(
      `✅ Mensajes no leídos para landlord ${currentUserId}: ${unreadCount}`
    );

    return NextResponse.json({ unreadCount }, { status: 200 });
  } catch (error) {
    console.error("🛑 Error en /api/chat/unread-count:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
