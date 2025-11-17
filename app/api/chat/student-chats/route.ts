// app/api/chat/student-chats/route.ts
import { NextResponse } from "next/server";
// 🛑 CRÍTICO: Importamos el cliente con Service Role Key (permisos elevados)
import { supabaseService } from "../send/route";

// Interfaz para la estructura del mensaje crudo (ACTUALIZADA con roles)
interface Message {
  sender_id: number;
  recipient_id: number;
  property_id: number;
  content: string;
  created_at: string;
  sender_role: string; // ✅ Nuevo campo para desambiguación
  recipient_role: string; // ✅ Nuevo campo para desambiguación
}

/**
 * GET /api/chat/student-chats
 * Obtiene la lista de conversaciones del estudiante loggeado.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const studentIdString = url.searchParams.get("studentId");

    // 💡 DEBUG: Verificar el ID de entrada
    console.log(
      `DEBUG: 🔍 Buscando chats para Student ID (string): ${studentIdString}`
    );

    if (!studentIdString) {
      return NextResponse.json(
        { error: "Falta studentId en la query." },
        { status: 400 }
      );
    }

    const studentIdNumber = Number(studentIdString);

    if (isNaN(studentIdNumber)) {
      return NextResponse.json(
        { error: "El studentId no es un número válido." },
        { status: 400 }
      );
    }

    // 2. Consulta a Supabase: Traer todos los mensajes donde el estudiante loggeado
    // es el remitente O el destinatario.
    const filterQuery = `sender_id.eq.${studentIdNumber},recipient_id.eq.${studentIdNumber}`;
    console.log(
      `DEBUG: 🔍 Usando filtro de Supabase (numérico): ${filterQuery}`
    );

    const { data: messages, error } = await supabaseService
      .from("messages")
      // ✅ CRÍTICO: Seleccionar los nuevos campos de rol
      .select(
        "sender_id, recipient_id, property_id, content, created_at, sender_role, recipient_role"
      )
      .or(filterQuery)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "DEBUG: ❌ ERROR de Supabase al obtener mensajes:",
        error.message
      );
      return NextResponse.json(
        { error: "Error de base de datos al obtener mensajes." },
        { status: 500 }
      );
    }

    // 💡 DEBUG: Verificar cuántos mensajes se obtuvieron
    const totalMessages = messages?.length || 0;
    console.log(
      `DEBUG: ✅ Mensajes obtenidos de Supabase (RAW): ${totalMessages}`
    );

    // 3. Agrupar mensajes en conversaciones únicas
    const conversationsMap = new Map();

    (messages as Message[]).forEach((msg) => {
      // 🛑 LÓGICA CLAVE CORREGIDA: Determinamos el ID del arrendador usando el campo de rol.
      // Así, evitamos la colisión de IDs.
      const landlordId =
        msg.sender_role === "LANDLORD" ? msg.sender_id : msg.recipient_id;

      // 3b. Crear la clave única de la conversación (Arrendador + Propiedad)
      const key = `${String(landlordId)}-${String(msg.property_id)}`;

      // 3c. Solo guardar el mensaje más reciente
      if (
        !conversationsMap.has(key) ||
        new Date(msg.created_at) >
          new Date(conversationsMap.get(key).lastMessageTime)
      ) {
        conversationsMap.set(key, {
          studentId: studentIdString,
          landlordId: String(landlordId),
          propertyId: String(msg.property_id),
          lastMessageContent: msg.content,
          lastMessageTime: msg.created_at,
        });
      }
    });

    // 4. Convertir el mapa de conversaciones a un array
    const conversations = Array.from(conversationsMap.values());

    // 💡 DEBUG: Verificar cuántas conversaciones se generaron
    console.log(
      `DEBUG: ✅ Conversaciones finales agrupadas: ${conversations.length}`
    );

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (e) {
    console.error("DEBUG: 🛑 Error inesperado en GET /student-chats:", e);
    return NextResponse.json(
      { error: "Fallo interno del servidor." },
      { status: 500 }
    );
  }
}
