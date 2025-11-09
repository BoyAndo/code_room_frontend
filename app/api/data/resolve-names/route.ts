// app/api/data/resolve-names/route.ts
import { NextRequest, NextResponse } from "next/server";

// 🚨 Asegúrate de que esta URL apunte a tu microservicio Express
const MICROSERVICE_DATA_API_URL = "http://localhost:3001/user";

// Tipo base para el mapeo de ID a Nombre
type Item = { id: number | string; name: string };

/**
 * POST /api/data/resolve-names
 * Proxy que reenvía solicitudes al microservicio de registro para obtener nombres de usuarios y propiedades.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      propertyIds?: Array<number | string>;
      studentIds?: Array<number | string>;
      landlordIds?: Array<number | string>; // Esperamos Landlord IDs
    };

    const propertyIds = Array.isArray(body?.propertyIds)
      ? body.propertyIds
      : [];
    const studentIds = Array.isArray(body?.studentIds) ? body.studentIds : [];
    const landlordIds = Array.isArray(body?.landlordIds)
      ? body.landlordIds
      : []; // Recibimos Landlord IDs

    if (
      propertyIds.length === 0 &&
      studentIds.length === 0 &&
      landlordIds.length === 0
    ) {
      return NextResponse.json({ properties: [], users: [] }, { status: 200 });
    }

    // --- 1. LLAMADA AL MICROSERVICIO EXTERNO (API Proxy) ---
    const response = await fetch(`${MICROSERVICE_DATA_API_URL}/resolve-names`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Enviamos todos los IDs convertidos a string
        propertyIds: propertyIds.map(String),
        studentIds: studentIds.map(String),
        landlordIds: landlordIds.map(String), // Enviamos Landlord IDs
      }),
    });

    if (!response.ok) {
      console.error(
        "DEBUG: ❌ Fallo al obtener nombres del microservicio (Status):",
        response.status,
        await response.text()
      );
      // Devolvemos una respuesta vacía pero 200 si el fallo es del microservicio, para no romper el frontend
      return NextResponse.json({ properties: [], users: [] }, { status: 200 });
    }

    // 2. RECUPERAR Y CONSOLIDAR DATOS
    const data = await response.json();
    const propertiesData: Item[] = data.properties || [];

    // 🛑 CRÍTICO: Consolida todos los usuarios en el array 'users', como lo hace el controlador de Express.
    const usersData: Item[] = data.users || [];

    return NextResponse.json(
      {
        properties: propertiesData,
        users: usersData,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("DEBUG: 🛑 Error general al resolver nombres:", err);
    return NextResponse.json(
      { error: "Error de red o interno al llamar al microservicio" },
      { status: 500 }
    );
  }
}
