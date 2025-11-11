"use client";

import { useState, useCallback, useEffect } from "react";
import { PropertyFormData, Property } from "@/types/property";
import { useAuth, isLandlord } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";

export function usePropertyEdit(property: Property | null) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados del formulario
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    propertyType: "",
    monthlyRent: "",
    address: "",
    bedrooms: 1,
    bathrooms: 1,
    squareMeters: "",
    regionName: "",
    comunaName: "",
    regionId: 1,
    comunaId: 1,
    amenities: [],
    utilityBill: null,
    propertyImages: [],
    latitude: null,
    longitude: null,
  });

  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // URLs de imágenes a eliminar
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateStatus, setUpdateStatus] = useState<
    "loading" | "success" | "error" | null
  >(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Cargar datos de la propiedad cuando cambie
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        description: property.description || "",
        propertyType: property.propertyType || "",
        monthlyRent: property.monthlyRent?.toString() || "",
        address: property.address || "",
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        squareMeters: property.squareMeters?.toString() || "",
        // Manejar comuna y region cuando son objetos o strings
        regionName: typeof property.region === 'string' ? property.region : (property.region as any)?.name || property.regionName || "",
        comunaName: typeof property.comuna === 'string' ? property.comuna : (property.comuna as any)?.name || property.comunaName || "",
        regionId: property.regionId || 1,
        comunaId: property.comunaId || 1,
        amenities: property.amenities?.map((a) => a.id) || [],
        utilityBill: null,
        propertyImages: [],
        // Asegurar que latitude y longitude sean números
        latitude: property.latitude ? Number(property.latitude) : null,
        longitude: property.longitude ? Number(property.longitude) : null,
      });

      // Cargar imágenes existentes
      const images = property.images || [];
      setExistingImages(images);
      setImagesPreviews(images);
    }
  }, [property]);

  // Handler para cambios en campos individuales
  const handleFieldChange = useCallback(
    (field: keyof PropertyFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Nota: No incluimos handlers para región y comuna porque no se pueden cambiar
  // La ubicación está validada con la cuenta de servicios

  // Handler para toggle de amenidades
  const handleAmenityToggle = useCallback(
    (amenityId: number) => {
      setFormData((prev) => {
        const currentAmenities = prev.amenities || [];
        const isSelected = currentAmenities.includes(amenityId);

        if (isSelected) {
          return {
            ...prev,
            amenities: currentAmenities.filter((id) => id !== amenityId),
          };
        } else {
          if (currentAmenities.length >= 3) {
            toast({
              title: "Límite alcanzado",
              description: "Solo puedes seleccionar hasta 3 amenidades",
              variant: "destructive",
            });
            return prev;
          }
          return {
            ...prev,
            amenities: [...currentAmenities, amenityId],
          };
        }
      });
    },
    [toast]
  );

  // Handler para cambio de imágenes
  // Recibe files y previews desde el componente FileUploadsForm
  const handleImagesChange = useCallback(
    (files: File[], previews: string[]) => {
      handleFieldChange("propertyImages", files);
      setImagesPreviews(previews);
    },
    [handleFieldChange]
  );

  // Handler para eliminar una imagen específica
  const handleRemoveImage = useCallback(
    (index: number) => {
      console.log("🗑️ Eliminando imagen en índice:", index);
      console.log("📊 Estado actual - Existentes:", existingImages.length, "Nuevas:", formData.propertyImages.length);
      
      // Verificar si el índice corresponde a una imagen existente o nueva
      if (index < existingImages.length) {
        // Es una imagen existente, agregar a la lista de eliminación
        const imageToDelete = existingImages[index];
        console.log("🗑️ Imagen existente a eliminar:", imageToDelete);
        
        setImagesToDelete(prev => {
          const updated = [...prev, imageToDelete];
          console.log("📝 Array de imágenes a eliminar actualizado:", updated);
          return updated;
        });
        
        // Remover de existingImages
        setExistingImages(prev => prev.filter((_, i) => i !== index));
        
        // Remover del preview correspondiente
        setImagesPreviews(prev => prev.filter((_, i) => i !== index));
      } else {
        // Es una imagen nueva (File), solo remover del preview y formData
        const newImageIndex = index - existingImages.length;
        console.log("📸 Eliminando imagen nueva en índice relativo:", newImageIndex);
        
        // Remover de propertyImages (formData)
        handleFieldChange("propertyImages", 
          formData.propertyImages.filter((_, i) => i !== newImageIndex)
        );
        
        // Remover del preview
        setImagesPreviews(prev => prev.filter((_, i) => i !== index));
      }

      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido removida de la propiedad",
      });
    },
    [existingImages, formData.propertyImages, handleFieldChange, toast]
  );

  // Función para actualizar la propiedad
  const updateProperty = useCallback(async () => {
    if (!user || !isLandlord(user) || !property) return false;

    // Validación básica (solo campos editables)
    if (!formData.title || !formData.description) {
      toast({
        title: "Error",
        description:
          "Por favor completa los campos requeridos: título y descripción",
        variant: "destructive",
      });
      return false;
    }

    setIsUpdating(true);
    setUpdateStatus("loading");
    setErrorMessages([]);

    try {
      const submitData = new FormData();

      // Agregar solo los campos editables del formulario
      submitData.append("title", formData.title);
      submitData.append("description", formData.description || "");
      submitData.append("propertyType", formData.propertyType);
      submitData.append("monthlyRent", formData.monthlyRent.toString());
      // NO incluimos address - no se puede editar (validado con cuenta de servicios)
      submitData.append("bedrooms", formData.bedrooms.toString());
      submitData.append("bathrooms", formData.bathrooms.toString());
      submitData.append("squareMeters", formData.squareMeters || "");
      // NO incluimos region/comuna - no se pueden editar (validados con cuenta de servicios)
      submitData.append("landlordId", user.id.toString());
      submitData.append("landlordName", user.landlordName);

      // Agregar coordenadas si existen
      if (formData.latitude !== null && formData.latitude !== undefined) {
        submitData.append("latitude", formData.latitude.toString());
      }
      if (formData.longitude !== null && formData.longitude !== undefined) {
        submitData.append("longitude", formData.longitude.toString());
      }

      // Agregar amenidades como JSON string
      if (formData.amenities && formData.amenities.length > 0) {
        submitData.append("amenities", JSON.stringify(formData.amenities));
      }

      // NO incluimos utilityBill - no se puede cambiar en edición
      // La dirección está validada con la cuenta de servicios original

      // Agregar imágenes a eliminar (URLs de imágenes existentes)
      if (imagesToDelete.length > 0) {
        console.log("🗑️ Imágenes a eliminar:", imagesToDelete);
        submitData.append("imagesToDelete", JSON.stringify(imagesToDelete));
      } else {
        console.log("ℹ️ No hay imágenes para eliminar");
      }

      // Agregar nuevas imágenes solo si hay
      if (formData.propertyImages && formData.propertyImages.length > 0) {
        console.log(`📸 Agregando ${formData.propertyImages.length} nuevas imágenes`);
        formData.propertyImages.forEach((image) => {
          submitData.append("propertyImages", image);
        });
      }

      const response = await apiFetch(
        `http://localhost:3002/api/properties/${property.id}`,
        {
          method: "PUT",
          body: submitData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        
        // Verificar si hay errores detallados
        if (
          data.errors &&
          Array.isArray(data.errors) &&
          data.errors.length > 0
        ) {
          setErrorMessages(data.errors);
          setUpdateStatus("error");
        } else {
          setErrorMessages([
            data.message || "No se pudo actualizar la propiedad",
          ]);
          setUpdateStatus("error");
        }
        return false;
      }

      const data = await response.json();

      setUpdateStatus("success");
      return true;
    } catch (error) {
      console.error("Error actualizando propiedad:", error);
      setErrorMessages([
        error instanceof Error
          ? error.message
          : "Error de conexión. Verifica tu conexión a internet.",
      ]);
      setUpdateStatus("error");
      return false;
    }
    // NO cerramos el modal aquí, el usuario debe cerrarlo manualmente
  }, [user, formData, property, toast]);

  const closeModal = useCallback(() => {
    setIsUpdating(false);
    setUpdateStatus(null);
    setErrorMessages([]);
  }, []);

  return {
    formData,
    imagesPreviews,
    existingImages,
    isUpdating,
    updateStatus,
    errorMessages,
    handleFieldChange,
    handleAmenityToggle,
    handleImagesChange,
    handleRemoveImage,
    updateProperty,
    closeModal,
  };
}
