// lib/pusher.server.ts

// Usamos 'pusher' (sin -js) para el backend
import Pusher from "pusher";

// Las variables sin el prefijo NEXT_PUBLIC_ se usan aquí.
const PUSHER_APP_ID = process.env.PUSHER_APP_ID;
const PUSHER_SECRET = process.env.PUSHER_SECRET;
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY; // Se usa la pública para la inicialización
const PUSHER_CLUSTER = process.env.PUSHER_CLUSTER;

if (!PUSHER_APP_ID || !PUSHER_SECRET || !PUSHER_KEY || !PUSHER_CLUSTER) {
  throw new Error(
    "Faltan variables de entorno de Pusher (APP_ID, SECRET, KEY, CLUSTER). Revisa tu archivo .env."
  );
}

// Inicialización del cliente de Pusher para el lado del servidor.
// Este objeto es el que tiene permiso para DISPARAR eventos.
export const pusherServer = new Pusher({
  appId: PUSHER_APP_ID,
  key: PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: PUSHER_CLUSTER,
  useTLS: true, // Siempre recomendado usar en producción
});
