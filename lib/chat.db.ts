// lib/chat.db.ts
import { supabase } from "@/lib/supabase"; // Importa el cliente de Supabase (Server-side)

// Estructura de mensaje: IDs de usuario/propiedad como 'number'
export interface Message {
  id: number;
  sender_id: number; // Coincide con int4 en Supabase
  recipient_id: number; // Coincide con int4 en Supabase
  property_id: number; // Coincide con int4 en Supabase
  content: string;
  created_at: string;
}

// Nombre de la tabla en Supabase
const MESSAGES_TABLE = "messages";

/**
 * Obtiene el historial de mensajes entre dos usuarios para una propiedad específica.
 * @param userId1 ID del primer participante (number).
 * @param userId2 ID del segundo participante (number).
 * @param propertyId ID de la propiedad (number).
 * @returns Array de mensajes ordenados cronológicamente, o null si hay error.
 */
export async function getChatHistory(
  userId1: number,
  userId2: number,
  propertyId: number
): Promise<Message[] | null> {
  // Consulta filtrando por la propiedad y ambas combinaciones de sender/recipient
  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .select("*")
    .eq("property_id", propertyId)
    .or(
      `and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error al obtener historial de chat:", error.message);
    return null;
  }

  // Los datos devueltos coinciden con la interfaz Message
  return data as Message[];
}

/**
 * Guarda un nuevo mensaje en la base de datos.
 * @param senderId ID del remitente (number).
 * @param recipientId ID del receptor (number).
 * @param propertyId ID de la propiedad (number).
 * @param content Contenido del mensaje.
 * @returns El objeto Message guardado (con id y created_at generados), o null si hay error.
 */
export async function saveMessage(
  senderId: number,
  recipientId: number,
  propertyId: number,
  content: string
): Promise<Message | null> {
  // Objeto de datos a insertar
  const messageData = {
    sender_id: senderId,
    recipient_id: recipientId,
    property_id: propertyId,
    content: content,
  };

  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .insert(messageData)
    .select() // Solicitamos que Supabase devuelva el objeto insertado con ID y timestamp
    .single();

  if (error) {
    console.error("Error al guardar mensaje:", error.message);
    return null;
  }

  // Devolvemos el mensaje completo
  return data as Message;
}
