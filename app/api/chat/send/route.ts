// app/api/chat/send/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
// 🛑 CORRECCIÓN 1: Usamos la función final 'saveMessage'
import { saveMessage } from "@/lib/chat.db";
import { getUserIdFromRequest } from "@/lib/auth.server";
// 🛑 CORRECCIÓN 2: Usamos la importación estándar para Pusher Server
import { pusherServer } from "@/lib/pusher.server";

export async function POST(request: Request) {
  const data = await request.json(); // Data: { recipientId, propertyId, content }

  // El ID de usuario actual debe ser un número (coherente con Prisma Int)
  const currentUserId = await getUserIdFromRequest();

  if (!currentUserId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  // --- 🛑 Conversión de Tipos (CRÍTICA) ---
  // Aseguramos que los IDs sean números para la DB (int4)
  const senderId = currentUserId; // Ya es number desde getUserIdFromRequest
  const recipientId = Number(data.recipientId);
  const propertyId = Number(data.propertyId);
  const content = data.content;

  // Verificación básica de datos
  if (isNaN(recipientId) || isNaN(propertyId) || !content) {
    return NextResponse.json(
      { error: "Datos de mensaje incompletos o inválidos." },
      { status: 400 }
    );
  }

  try {
    // 1. GUARDAR EN LA BASE DE DATOS (Supabase)
    // La función saveMessage devuelve el objeto completo de la DB (Message | null)
    const savedMessage = await saveMessage(
      senderId,
      recipientId,
      propertyId,
      content
    );

    if (!savedMessage) {
      throw new Error("Fallo al guardar mensaje en la base de datos.");
    }

    // --- Preparación para Pusher ---

    // El frontend espera IDs como STRING para la lógica de visualización (ChatWindow.tsx)
    const u1Str = String(senderId);
    const u2Str = String(recipientId);

    // 2. CONSTRUIR EL NOMBRE DEL CANAL ÚNICO
    const channelId = [u1Str, u2Str].sort().join("-");
    const propertyIdStr = String(propertyId);
    const channelName = `chat-propiedad-${propertyIdStr}-${channelId}`;

    // El objeto de mensaje para el frontend debe usar senderId (string) y timestamp (string)
    const messageForFrontend = {
      id: savedMessage.id,
      senderId: u1Str,
      content: savedMessage.content,
      timestamp: savedMessage.created_at,
    };

    // 3. DISPARAR EL EVENTO DE WEBSOCKET (Pusher) a la conversación
    await pusherServer.trigger(channelName, "new-message", messageForFrontend);

    // 4. DISPARAR EVENTO DE NOTIFICACIÓN (Opcional, pero bien implementado)
    const recipientChannel = `notifications-user-${u2Str}`;
    await pusherServer.trigger(recipientChannel, "new-unread-message", {
      senderId: u1Str,
      propertyId: propertyIdStr,
    });

    return NextResponse.json(
      { success: true, message: messageForFrontend },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔴 Error en API de envío:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
