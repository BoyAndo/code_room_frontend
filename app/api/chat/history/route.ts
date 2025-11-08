// app/api/chat/history/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
// 🛑 CORRECCIÓN 1: Cambiamos el nombre de la importación a la función correcta
import { getChatHistory } from "@/lib/chat.db";
import { getUserIdFromRequest } from "@/lib/auth.server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Los IDs vienen como string de la URL
  const landlordIdStr = searchParams.get("landlordId");
  const propertyIdStr = searchParams.get("propertyId");

  // currentUserId debería ser number | null
  const currentUserId = await getUserIdFromRequest();

  if (!currentUserId) {
    return NextResponse.json(
      { error: "No autorizado. Se requiere autenticación." },
      { status: 401 }
    );
  }

  if (!landlordIdStr || !propertyIdStr) {
    return NextResponse.json(
      { error: "Faltan parámetros de consulta (landlordId/propertyId)." },
      { status: 400 }
    );
  }

  try {
    // 🛑 CORRECCIÓN 2: Convertimos todos los IDs a Number antes de pasarlos a la función DB
    const landlordId = Number(landlordIdStr);
    const propertyId = Number(propertyIdStr);

    // Verificamos que las conversiones sean válidas
    if (isNaN(landlordId) || isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Los IDs de usuario/propiedad deben ser números válidos." },
        { status: 400 }
      );
    }

    // Llamamos a la función DB con los IDs como números
    const messages = await getChatHistory(
      currentUserId, // Ya es number de getUserIdFromRequest
      landlordId,
      propertyId
    );

    if (!messages) {
      return NextResponse.json([], { status: 200 }); // Devuelve un array vacío si no hay mensajes o si la DB falló
    }

    // 🛑 CORRECCIÓN 3: Mapeo de la respuesta para el frontend
    // El frontend espera 'senderId' y 'timestamp', no 'sender_id' y 'created_at'
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: String(msg.sender_id), // El frontend espera String
      content: msg.content,
      timestamp: msg.created_at,
    }));

    return NextResponse.json(formattedMessages, { status: 200 });
  } catch (error) {
    console.error("🔴 Error al obtener historial de chat:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener historial." },
      { status: 500 }
    );
  }
}
