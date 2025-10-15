"use client";

import { useState, useCallback } from "react";
import { PropertyFormData, Amenity, Property } from "@/types/property";
import { useAuth, isLandlord } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const initialFormData: PropertyFormData = {
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
};

export function usePropertyForm() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados del formulario
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [selectedRegionId, setSelectedRegionId] = useState<number>(1);
  const [selectedComunaId, setSelectedComunaId] = useState<number>(1);
  const [utilityBillPreview, setUtilityBillPreview] = useState<string | null>(
    null
  );
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [creationStatus, setCreationStatus] = useState<
    "loading" | "success" | "error" | null
  >(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Handler para cambios en campos del formulario
  const handleFieldChange = useCallback(
    (field: keyof PropertyFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Handler para cambios en región
  const handleRegionChange = useCallback(
    (regionId: number | null, regionName?: string | null) => {
      const id = regionId || 1;
      const name = regionName || "";
      setSelectedRegionId(id);
      setFormData((prev) => ({
        ...prev,
        regionId: id,
        regionName: name,
        comunaId: 1,
        comunaName: "",
      }));
      setSelectedComunaId(1);
    },
    []
  );

  // Handler para cambios en comuna
  const handleComunaChange = useCallback(
    (comunaId: number | null, comunaName?: string | null) => {
      const id = comunaId || 1;
      const name = comunaName || "";
      setSelectedComunaId(id);
      setFormData((prev) => ({
        ...prev,
        comunaId: id,
        comunaName: name,
      }));
    },
    []
  );

  // Handler para toggle de amenidades
  const handleAmenityToggle = useCallback((amenityId: number) => {
    setFormData((prev) => {
      const currentAmenities = prev.amenities;
      if (currentAmenities.includes(amenityId)) {
        return {
          ...prev,
          amenities: currentAmenities.filter((id) => id !== amenityId),
        };
      } else if (currentAmenities.length < 3) {
        return {
          ...prev,
          amenities: [...currentAmenities, amenityId],
        };
      }
      return prev;
    });
  }, []);

  // Handler para cambios en cuenta de servicios
  const handleUtilityBillChange = useCallback(
    (file: File | null, preview: string | null) => {
      setFormData((prev) => ({ ...prev, utilityBill: file }));
      setUtilityBillPreview(preview);
    },
    []
  );

  // Handler para cambios en imágenes
  const handleImagesChange = useCallback(
    (files: File[], previews: string[]) => {
      setFormData((prev) => ({ ...prev, propertyImages: files }));
      setImagesPreviews(previews);
    },
    []
  );

  // Función para resetear el formulario
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setUtilityBillPreview(null);
    setImagesPreviews([]);
    setSelectedRegionId(1);
    setSelectedComunaId(1);
  }, []);

  // Función para crear propiedad
  const createProperty = useCallback(async () => {
    if (!user || !isLandlord(user)) return false;

    // Validación
    if (
      !formData.title ||
      !formData.description ||
      !formData.address ||
      !formData.monthlyRent ||
      !formData.propertyType ||
      formData.amenities.length === 0 ||
      !formData.utilityBill ||
      formData.propertyImages.length === 0
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return false;
    }

    // Validar que las amenidades sean números válidos
    const invalidAmenities = formData.amenities.filter(
      (id) => typeof id !== "number" || id <= 0
    );
    if (invalidAmenities.length > 0) {
      toast({
        title: "Error",
        description: "Las amenidades seleccionadas no son válidas",
        variant: "destructive",
      });
      return false;
    }

    setIsCreating(true);
    setCreationStatus("loading");
    setErrorMessages([]);

    try {
      const submitData = new FormData();

      // Campos básicos
      submitData.append("landlordId", user.id?.toString() || "1");
      submitData.append(
        "landlordName",
        isLandlord(user) ? user.landlordName : "Usuario"
      );
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("address", formData.address);
      submitData.append("regionName", formData.regionName);
      submitData.append("comunaName", formData.comunaName);
      submitData.append("regionId", formData.regionId.toString());
      submitData.append("comunaId", formData.comunaId.toString());
      submitData.append("propertyType", formData.propertyType);
      submitData.append("bedrooms", formData.bedrooms.toString());
      submitData.append("bathrooms", formData.bathrooms.toString());
      submitData.append("squareMeters", formData.squareMeters || "");
      submitData.append("monthlyRent", formData.monthlyRent);

      // Amenidades - enviar como JSON string
      submitData.append("amenities", JSON.stringify(formData.amenities));

      // Archivos
      submitData.append("utilityBill", formData.utilityBill);
      formData.propertyImages.forEach((image) => {
        submitData.append("propertyImages", image);
      });

      const response = await fetch("http://localhost:3002/api/properties", {
        method: "POST",
        credentials: "include", // Para enviar cookies de autenticación
        body: submitData,
      });

      const responseData = await response.json();

      if (response.ok) {
        setCreationStatus("success");
        return true;
      } else {
        // Verificar si hay errores detallados de validación OCR
        if (
          responseData.errors &&
          Array.isArray(responseData.errors) &&
          responseData.errors.length > 0
        ) {
          setErrorMessages(responseData.errors);
          setCreationStatus("error");
        } else {
          setErrorMessages([
            responseData.message || "No se pudo crear la propiedad",
          ]);
          setCreationStatus("error");
        }

        return false;
      }
    } catch (error) {
      console.error("❌ Error de red:", error);
      setErrorMessages(["Error de conexión. Verifica tu conexión a internet."]);
      setCreationStatus("error");
      return false;
    }
    // NO cerramos el modal aquí, el usuario debe cerrarlo manualmente
  }, [user, formData, toast, resetForm]);

  const closeModal = useCallback(() => {
    setIsCreating(false);
    setCreationStatus(null);
    setErrorMessages([]);
    // Si fue exitoso, limpiar el formulario
    if (creationStatus === "success") {
      resetForm();
    }
  }, [creationStatus, resetForm]);

  return {
    formData,
    selectedRegionId,
    selectedComunaId,
    utilityBillPreview,
    imagesPreviews,
    isCreating,
    creationStatus,
    errorMessages,
    handleFieldChange,
    handleRegionChange,
    handleComunaChange,
    handleAmenityToggle,
    handleUtilityBillChange,
    handleImagesChange,
    resetForm,
    createProperty,
    closeModal,
  };
}
