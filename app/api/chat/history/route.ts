import { NextRequest, NextResponse } from "next/server";
import { authCheck } from "@/lib/auth.server";
// Importamos el cliente de Supabase con Service Role Key
import { supabaseService } from "../send/route";

/**
 * GET /api/chat/history
 * Carga el historial de mensajes entre dos usuarios para una propiedad específica.
 * Query params: propertyId, landlordId, studentId (AHORA ACEPTA LOS TRES IDs)
 */
export async function GET(req: NextRequest) {
  try {
    // 1. AUTENTICACIÓN
    const { user } = await authCheck();
    if (!user || !user.id) {
      console.error("DEBUG: 🔴 Fallo de autenticación en /api/chat/history.");
      return NextResponse.json(
        { error: "No autorizado o token inválido" },
        { status: 401 }
      );
    }
    const currentUserId = user.id;

    // 2. RECEPCIÓN DE LOS 3 PARÁMETROS DEL FRONTEND
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const landlordIdParam = searchParams.get("landlordId");
    const studentIdParam = searchParams.get("studentId");

    if (!propertyId || !landlordIdParam || !studentIdParam) {
      // Nuevo mensaje de error para ayudar a la depuración
      return NextResponse.json(
        { error: "Faltan propertyId, landlordId o studentId" },
        { status: 400 }
      );
    }

    // 3. DETERMINAR EL ID DEL OTRO USUARIO (numericOtherUserId)
    const numericCurrentUserId = Number(currentUserId);
    const numericPropertyId = Number(propertyId);

    let numericOtherUserId: number;

    // Si el usuario actual es el arrendador en la conversación
    if (String(numericCurrentUserId) === landlordIdParam) {
      numericOtherUserId = Number(studentIdParam);
    }
    // Si el usuario actual es el estudiante en la conversación
    else if (String(numericCurrentUserId) === studentIdParam) {
      numericOtherUserId = Number(landlordIdParam);
    } else {
      console.error(
        "DEBUG: ❌ El usuario actual no pertenece a este chat (ID no coincide con landlord/student)."
      );
      return NextResponse.json(
        { error: "El usuario no pertenece a esta conversación." },
        { status: 403 }
      );
    }

    // Verificación de conversión
    if (
      isNaN(numericCurrentUserId) ||
      isNaN(numericOtherUserId) ||
      isNaN(numericPropertyId)
    ) {
      console.error("DEBUG: ❌ Error de conversión de IDs a números.");
      return NextResponse.json(
        { error: "Los IDs de usuario o propiedad no son números válidos." },
        { status: 400 }
      );
    }

    // 4. CONSULTA EN SUPABASE
    const { data: messages, error: dbError } = await supabaseService
      .from("messages")
      // ✅ Seleccionamos los campos de rol
      .select("*, sender_role, recipient_role")
      .eq("property_id", numericPropertyId)
      // Filtro OR que incluye todos los mensajes entre numericCurrentUserId y numericOtherUserId
      .or(
        `and(sender_id.eq.${numericCurrentUserId},recipient_id.eq.${numericOtherUserId}),and(sender_id.eq.${numericOtherUserId},recipient_id.eq.${numericCurrentUserId})`
      )
      .order("created_at", { ascending: true });

    if (dbError) {
      console.error(
        "DEBUG: ❌ ERROR de Supabase al obtener historial:",
        dbError.message
      );
      return NextResponse.json(
        {
          error: "Fallo al obtener historial de mensajes",
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      `DEBUG: ✅ Historial cargado. Total mensajes: ${messages?.length || 0}`
    );

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("DEBUG: 🛑 Error general en /api/chat/history:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
