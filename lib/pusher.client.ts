// lib/pusher.client.ts

// Usamos 'pusher-js' para el frontend
import PusherClient from "pusher-js";

// Aseguramos que las variables de entorno estén disponibles
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_CLUSTER =
  process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

// Verificación necesaria: si no tenemos la clave, no inicializamos (aunque deberíamos)
if (!PUSHER_KEY || !PUSHER_CLUSTER) {
  throw new Error(
    "Faltan claves de Pusher (NEXT_PUBLIC_PUSHER_KEY o PUSHER_CLUSTER) en las variables de entorno."
  );
}

// Inicialización del cliente de Pusher
export const pusherClient = new PusherClient(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
  // Opcional: Si usas canales privados/presencia, debes añadir authEndpoint aquí
  // authEndpoint: "/api/pusher/auth",
  // auth: {
  //     headers: {
  //         // Puedes enviar cookies o headers adicionales si es necesario para la autenticación
  //     },
  // },
});
