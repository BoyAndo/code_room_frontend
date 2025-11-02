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
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Función para obtener propiedades
  const fetchProperties = useCallback(async () => {
    if (!user) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_PROPERTIES_URL || "http://localhost:3002/api";
      const response = await fetch(
        `${API_URL}/properties/my-properties`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
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
      const API_URL = process.env.NEXT_PUBLIC_API_PROPERTIES_URL || "http://localhost:3002/api";
      const response = await fetch(
        `${API_URL}/properties/amenities`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          }
        }
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

  // Función para abrir el modal de confirmación de eliminación
  const requestDeleteProperty = useCallback((property: Property) => {
    setPropertyToDelete(property);
  }, []);

  // Función para cancelar la eliminación
  const cancelDelete = useCallback(() => {
    setPropertyToDelete(null);
  }, []);

  // Función para confirmar y ejecutar la eliminación
  const confirmDeleteProperty = useCallback(async () => {
    if (!propertyToDelete) return;

    setIsDeleting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_PROPERTIES_URL || "http://localhost:3002/api";
      const response = await fetch(
        `${API_URL}/properties/${propertyToDelete.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        toast({
          title: "✅ Propiedad eliminada",
          description: "La propiedad se ha eliminado exitosamente",
          duration: 5000,
        });
        setPropertyToDelete(null);
        fetchProperties();
      } else {
        const errorData = await response.json();
        toast({
          title: "❌ Error",
          description: errorData.message || "No se pudo eliminar la propiedad",
          variant: "destructive",
          duration: 6000,
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Error de conexión. Verifica tu conexión a internet.",
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [propertyToDelete, toast, fetchProperties]);

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
    propertyToDelete,
    isDeleting,
    setSearchTerm,
    fetchProperties,
    requestDeleteProperty,
    confirmDeleteProperty,
    cancelDelete,
  };
}
