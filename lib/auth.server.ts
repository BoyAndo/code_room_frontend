// lib/auth.server.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// 🛑 INTERFACES (Asegúrate de que coincidan con tu JWT)
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

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET no está definido en las variables de entorno de Next.js."
  );
}

export async function getUserIdFromRequest(): Promise<number | null> {
  const tokenRaw = (await cookies()).get("authToken")?.value;

  if (!tokenRaw) {
    return null;
  }

  const token = tokenRaw.trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET!, {
      algorithms: ["HS256"],
    }) as UserPayload;

    return decoded.id;
  } catch (error) {
    console.error("Fallo al verificar el token:", error);
    return null;
  }
}
