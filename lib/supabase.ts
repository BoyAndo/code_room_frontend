// lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

// Usamos las variables de entorno para inicializar el cliente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY). Revisa tu archivo .env."
  );
}

// Creamos un cliente para el lado del servidor.
// Utilizamos las claves públicas, ya que Supabase maneja la autenticación a nivel de base de datos
// a través de RLS (Row Level Security), lo cual no es relevante para esta implementación simple de chat,
// pero es la forma más común y segura de inicializar el cliente de Next.js.
export const supabase = createClient(supabaseUrl, supabaseKey);
