// lib/pusher.client.ts

// Usamos 'pusher-js' para el frontend
import PusherClient from "pusher-js";

// Aseguramos que las variables de entorno estén disponibles
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

// Verificación necesaria: si no tenemos la clave, no inicializamos (aunque deberíamos)
if (!PUSHER_KEY || !PUSHER_CLUSTER) {
  console.error("❌ Faltan claves de Pusher:", {
    PUSHER_KEY: PUSHER_KEY ? "✅ Presente" : "❌ Faltante",
    PUSHER_CLUSTER: PUSHER_CLUSTER ? "✅ Presente" : "❌ Faltante",
  });
  throw new Error(
    "Faltan claves de Pusher (NEXT_PUBLIC_PUSHER_KEY o NEXT_PUBLIC_PUSHER_CLUSTER) en las variables de entorno."
  );
}

console.log("✅ Pusher Client inicializando con:", {
  key: PUSHER_KEY?.substring(0, 10) + "...",
  cluster: PUSHER_CLUSTER,
});

// Inicialización del cliente de Pusher
export const pusherClient = new PusherClient(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
  authEndpoint: "/api/pusher/auth",
  // Habilitar logging en desarrollo para debugging
  enabledTransports: ["ws", "wss"],
});
