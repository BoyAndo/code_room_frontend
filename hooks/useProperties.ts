"use client";

import { useState, useEffect, useCallback } from "react";
import { Property, Amenity } from "@/types/property";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useProperties() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [properties, setProperties] = useState<Property[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Función para obtener propiedades
  const fetchProperties = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(
        "http://localhost:3002/api/properties/my-properties",
        {
          credentials: "include", // Para enviar cookies de autenticación
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data) {
          setProperties(result.data);
        } else {
          console.error("Unexpected properties response format:", result);
        }
      } else {
        console.error(
          "Error response fetching properties:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  }, [user]);

  // Función para obtener amenidades
  const fetchAmenities = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:3002/api/properties/amenities"
      );

      if (response.ok) {
        const result = await response.json();

        // El API devuelve { success: true, data: { amenities: [...] } }
        if (result.success && result.data && result.data.amenities) {
          setAvailableAmenities(result.data.amenities);
        } else {
          console.error("Unexpected amenities response format:", result);
        }
      } else {
        console.error(
          "Error response fetching amenities:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching amenities:", error);
    }
  }, []);

  // Función para eliminar propiedad
  const deleteProperty = useCallback(
    async (propertyId: number) => {
      try {
        const response = await fetch(
          `http://localhost:3002/api/properties/${propertyId}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          toast({
            title: "Propiedad eliminada",
            description: "La propiedad se ha eliminado exitosamente",
          });
          fetchProperties();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la propiedad",
          variant: "destructive",
        });
      }
    },
    [toast, fetchProperties]
  );

  // Propiedades filtradas
  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Efectos
  useEffect(() => {
    if (user) {
      fetchProperties();
      fetchAmenities();
    }
  }, [user, fetchProperties, fetchAmenities]);

  return {
    properties,
    availableAmenities,
    searchTerm,
    filteredProperties,
    setSearchTerm,
    fetchProperties,
    deleteProperty,
  };
}
