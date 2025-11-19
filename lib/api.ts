import { apiFetch } from "./api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://13.216.81.127:3001";

// Tipos para Region y Comuna
export interface Region {
  id: number;
  code: string;
  name: string;
  romanNumber: string;
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

    const options: any = {
      method: "POST",
    };

    if (isFormData) {
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await apiFetch(url, options);
      console.log("🟢 Response status:", response.status, response.statusText);

      if (!response.ok) {
        console.error("🔴 Server error:", response.status, response.statusText);
      }

      return response;
    } catch (error) {
      console.error("🔴 Fetch error:", error);
      throw new Error(
        `No se pudo conectar con el servidor. Verifica que esté corriendo en ${url}`
      );
    }
  },

  async get(endpoint: string) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log("🔵 Making GET request to:", url);

    try {
      const response = await apiFetch(url, {
        method: "GET",
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
      const response = await this.get("/locations/regions");
      if (response.ok) {
        return await response.json();
      }
      throw new Error("Error al obtener las regiones");
    } catch (error) {
      console.error("Error fetching regions:", error);
      throw error;
    }
  },

  async getCommunesByRegion(regionId: number): Promise<Comuna[]> {
    try {
      const response = await this.get(`/locations/regions/${regionId}/comunas`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error("Error al obtener las comunas");
    } catch (error) {
      console.error("Error fetching communes:", error);
      throw error;
    }
  },
};
