const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Tipos para Region y Comuna
export interface Region {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comuna {
  id: number;
  name: string;
  regionId: number;
  createdAt: string;
  updatedAt: string;
  region?: Region;
}

export const api = {
  async post(endpoint: string, data: any, isFormData: boolean = false) {
    const url = `${API_BASE_URL}${endpoint}`;

    console.log("🔵 Making POST request to:", url);
    console.log("🔵 Is FormData:", isFormData);

    const options: RequestInit = {
      method: "POST",
      credentials: "include", // ✅ Para enviar cookies httpOnly
    };

    if (isFormData && data instanceof FormData) {
      options.body = data;
      // No establecer Content-Type para FormData
    } else {
      options.headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      console.log("🟢 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔴 Server error response:", errorText);
        throw new Error(errorText || "Error en la solicitud");
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response;
      } else {
        const text = await response.text();
        console.error("🔴 Unexpected response type:", contentType);
        console.error("🔴 Response body:", text);
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (error) {
      console.error("🔴 Fetch error:", error);
      throw error;
    }
  },

  async get(endpoint: string) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log("🔵 Making GET request to:", url);

    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("🟢 Response status:", response.status, response.statusText);
      return response;
    } catch (error) {
      console.error("🔴 Fetch error:", error);
      throw error;
    }
  },

  // Funciones para obtener regiones y comunas
  async getRegions(): Promise<Region[]> {
    try {
      console.log("Fetching regions from:", `${API_BASE_URL}/api/locations/regions`);
      const response = await this.get("/api/locations/regions");
      if (!response.ok) {
        const text = await response.text();
        console.error("Server response:", text);
        throw new Error("Error al obtener las regiones");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching regions:", error);
      throw error;
    }
  },

  async getCommunesByRegion(regionId: number): Promise<Comuna[]> {
    try {
      console.log("Fetching communes from:", `${API_BASE_URL}/api/locations/regions/${regionId}/comunas`);
      const response = await this.get(`/api/locations/regions/${regionId}/comunas`);
      if (!response.ok) {
        const text = await response.text();
        console.error("Server response:", text);
        throw new Error("Error al obtener las comunas");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching communes:", error);
      throw error;
    }
  },
};
