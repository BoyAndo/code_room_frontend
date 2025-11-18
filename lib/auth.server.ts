// lib/auth.server.ts

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// 🛑 INTERFACES (Confirma que coinciden con tu JWT)
export interface LandlordPayload {
  id: number;
  landlordRut: string;
  landlordEmail: string;
  landlordName: string;
  role: "landlord";
  iat: number;
  exp: number;
}
export interface StudentPayload {
  id: number;
  studentRut: string;
  studentEmail: string;
  studentName: string;
  studentCollege: string;
  role: "student";
  iat: number;
  exp: number;
}
export type UserPayload = LandlordPayload | StudentPayload;
// ----------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET;

// Validación solo en runtime (no en build time)
function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error(
      "JWT_SECRET no está definido en las variables de entorno de Next.js."
    );
  }
  return JWT_SECRET;
}

// // 💡 CÓDIGO DE DEPURACIÓN TEMPORAL (¡ELIMINAR AL FINALIZAR!)
// console.log("=========================================");
// console.log(
//   `DEBUG SECRETO: Primeros 10 chars: ${JWT_SECRET.substring(0, 10)}...`
// );
// console.log(`DEBUG SECRETO: Longitud total: ${JWT_SECRET.length}`);
// console.log("=========================================");
// // 💡 FIN CÓDIGO TEMPORAL

/**
 * Función que verifica el token y devuelve el objeto de usuario decodificado.
 */
export async function authCheck(): Promise<{ user: UserPayload | null }> {
  const tokenRaw = (await cookies()).get("authToken")?.value;

  if (!tokenRaw) {
    return { user: null };
  }

  const token = tokenRaw.trim();

  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    }) as UserPayload;

    return { user: decoded };
  } catch (error) {
    // Mantenemos este log para saber si falla la firma
    console.error("Fallo al verificar el token en authCheck:", error);
    return { user: null };
  }
}

// ... (El resto de las funciones auxiliares, si las tienes)
