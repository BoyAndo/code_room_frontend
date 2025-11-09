// /app/api/pusher/auth/route.ts

import { NextResponse } from "next/server";
import { authCheck } from "@/lib/auth.server";
import PusherServer from "pusher";

// --- CONFIGURACIÓN DE PUSHER (USANDO VARIABLES DE ENTORNO SIN NEXT_PUBLIC_) ---
const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

/**
 * POST /api/pusher/auth
 * Endpoint para autorizar la suscripción a canales privados de Pusher.
 */
export async function POST(req: Request) {
  try {
    // 1. AUTENTICACIÓN
    const { user } = await authCheck();
    if (!user || !user.id) {
      // El usuario no está autenticado, no puede autorizar canales privados.
      return new Response("Forbidden", { status: 403 });
    }

    // 2. RECUPERAR DATOS DE PUSHER
    const data = await req.formData();
    const socketId = data.get("socket_id")?.toString();
    const channel = data.get("channel_name")?.toString();

    if (!socketId || !channel) {
      return NextResponse.json(
        { error: "Faltan socket_id o channel_name." },
        { status: 400 }
      );
    }

    // 3. AUTORIZACIÓN
    const auth = pusherServer.authorizeChannel(socketId, channel, {
      // ✅ CORRECCIÓN: Forzamos user.id a string para eliminar el error de tipado
      user_id: String(user.id),
    });

    // 4. RESPUESTA EXITOSA
    return NextResponse.json(auth);
  } catch (error) {
    console.error("DEBUG: 🛑 Error en la autenticación de Pusher:", error);
    return NextResponse.json(
      { error: "Error interno en la autorización de Pusher." },
      { status: 500 }
    );
  }
}
