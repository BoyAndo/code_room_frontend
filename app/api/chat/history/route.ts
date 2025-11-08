// app/api/chat/history/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "../send/route"; // Importamos el cliente de Supabase Service
import { authCheck } from "@/lib/auth.server";

export async function GET(req: NextRequest) {
  try {
    // 1. AUTENTICACIÓN
    const { user } = await authCheck();
    if (!user || !user.id) {
      console.error("DEBUG: 🔴 Fallo de autenticación en /api/chat/history.");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const currentUserId = user.id;

    // 2. RECEPCIÓN DE QUERY PARAMS (¡Usa otherUserId!)
    // 2. RECEPCIÓN DE QUERY PARAMS (¡MODIFICADO: Aceptar studentId y landlordId!)
    const searchParams = req.nextUrl.searchParams;
    const propertyId = searchParams.get("propertyId");
    const studentId = searchParams.get("studentId"); // ID del estudiante enviado por el frontend
    const landlordId = searchParams.get("landlordId"); // ID del propietario enviado por el frontend

    if (!propertyId || !studentId || !landlordId) {
      console.error(
        "DEBUG: 🟡 Faltan IDs para cargar el historial (propertyId, studentId o landlordId)."
      );
      return NextResponse.json(
        { error: "Faltan parámetros de conversación" },
        { status: 400 }
      );
    }

    // 2b. DETERMINAR EL ID DEL OTRO USUARIO (`numericOtherUserId`)
    // El 'otherUserId' es el ID que NO coincide con el usuario autenticado (currentUserId).
    const numericStudentId = parseInt(studentId);
    const numericLandlordId = parseInt(landlordId);

    // Verificamos si el usuario actual es el estudiante o el propietario para determinar el otro ID
    const otherUserId =
      currentUserId === numericStudentId ? numericLandlordId : numericStudentId;

    // Si el currentUserId no coincide con ninguno de los dos, algo está mal
    if (
      currentUserId !== numericStudentId &&
      currentUserId !== numericLandlordId
    ) {
      console.error(
        "DEBUG: 🔴 Error de lógica. El usuario autenticado no es parte de esta conversación."
      );
      return NextResponse.json(
        { error: "Parámetros de usuario inválidos" },
        { status: 400 }
      );
    }

    const numericPropertyId = parseInt(propertyId);
    const numericOtherUserId = otherUserId; // El ID de la otra persona

    // 3. CONSULTA EN SUPABASE (Esta parte ya es correcta para la búsqueda simétrica)
    const { data: messages, error: dbError } = await supabaseService
      .from("messages")
      .select("*")
      .eq("property_id", numericPropertyId)
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${numericOtherUserId}),and(sender_id.eq.${numericOtherUserId},recipient_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (dbError) {
      console.error(
        "DEBUG: ❌ Error al cargar historial desde Supabase:",
        dbError.message
      );
      return NextResponse.json(
        { error: "Fallo al cargar el historial" },
        { status: 500 }
      );
    }

    console.log(
      `DEBUG: ✅ Historial cargado. Total mensajes: ${messages.length}`
    );

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("DEBUG: 🛑 Error general al cargar historial:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
