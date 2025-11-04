"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, isLandlord } from "@/contexts/AuthContext";
import { LandlordProfile } from "@/components/landlord/LandlordProfile";
import { Sidebar } from "@/components/landlord/Sidebar";
import { useState, useEffect } from "react";
import { Property } from "@/types/property";

// Importación de componentes necesarios
import { PropertyCard } from "@/components/landlord/PropertyCard";
import { BasicInfoForm } from "@/components/landlord/BasicInfoForm";
import { LocationForm } from "@/components/landlord/LocationForm";
import { AmenitiesForm } from "@/components/landlord/AmenitiesForm";
import { FileUploadsForm } from "@/components/landlord/FileUploadsForm";
import { PropertyCreationLoader } from "@/components/landlord/PropertyCreationLoader";
import { useProperties } from "@/hooks/useProperties";
import { usePropertyForm } from "@/hooks/usePropertyForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Building2, TrendingUp, DollarSign } from "lucide-react";

export default function LandlordDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "dashboard";

  // Estados y hooks necesarios para las diferentes vistas
  const {
    properties,
    availableAmenities,
    searchTerm,
    filteredProperties,
    setSearchTerm,
    fetchProperties,
    requestDeleteProperty,
  } = useProperties();

  const {
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
    closeModal,
    createProperty,
  } = usePropertyForm();

  // Efecto para cargar las propiedades cuando sea necesario
  useEffect(() => {
    if (currentView === "dashboard" || currentView === "properties") {
      fetchProperties();
    }
  }, [currentView]);

  // Loading state
  if (!user || !isLandlord(user)) {
    return (
      <div className="min-h-screen bg-cream/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const handleViewChange = (view: string) => {
    switch (view) {
      case "dashboard":
        router.push("/profile/landlord");
        break;
      case "properties":
        router.push("/profile/landlord?view=properties");
        break;
      case "create-property":
        router.push("/profile/landlord?view=create-property");
        break;
      case "profile":
        router.push("/profile/landlord?view=profile");
        break;
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleCreateProperty = async () => {
    const success = await createProperty();
    if (success) {
      router.push("/profile/landlord");
      fetchProperties();
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-800">
                  ¡Hola, {isLandlord(user) ? user.landlordName : "Usuario"}!
                </h1>
                <p className="text-neutral-600">
                  Aquí tienes un resumen de tus propiedades
                </p>
              </div>
              <Button
                onClick={() => handleViewChange("create-property")}
                className="bg-sage hover:bg-sage/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Propiedad
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">
                      Total Propiedades
                    </p>
                    <p className="text-2xl font-bold text-neutral-800">
                      {properties.length}
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-sage" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">
                      Propiedades Activas
                    </p>
                    <p className="text-2xl font-bold text-neutral-800">
                      {properties.filter((p) => p.isAvailable).length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-sage" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">
                      Ingresos Potenciales
                    </p>
                    <p className="text-2xl font-bold text-neutral-800">
                      ${properties
                        .reduce(
                          (total, property) =>
                            total + parseFloat(property.monthlyRent?.toString() || "0"),
                          0
                        )
                        .toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-sage" />
                </div>
              </div>
            </div>

            {properties.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-neutral-800">
                    Propiedades Recientes
                  </h2>
                  <button
                    onClick={() => handleViewChange("properties")}
                    className="text-sage hover:underline"
                  >
                    Ver todas
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {properties.slice(0, 2).map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onEdit={() => handleViewChange("edit-property")}
                      onDelete={() => requestDeleteProperty(property)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "properties":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">
                  Mis Propiedades
                </h1>
                <p className="text-neutral-600">
                  Administra tus propiedades publicadas
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Buscar propiedades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => handleViewChange("create-property")}
                className="bg-sage hover:bg-sage/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Propiedad
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onEdit={() => handleViewChange("edit-property")}
                  onDelete={() => requestDeleteProperty(property)}
                />
              ))}
            </div>
          </div>
        );

      case "create-property":
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-neutral-200 p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-800">
                  Crear Nueva Propiedad
                </h1>
                <p className="text-neutral-600">
                  Completa la información de tu propiedad
                </p>
              </div>

              <form className="space-y-8">
                <BasicInfoForm
                  formData={formData}
                  onFieldChange={handleFieldChange}
                />

                <LocationForm
                  formData={{
                    ...formData,
                    latitude: formData.latitude ?? null,
                    longitude: formData.longitude ?? null,
                  }}
                  selectedRegionId={selectedRegionId}
                  selectedComunaId={selectedComunaId}
                  onFieldChange={handleFieldChange}
                  onRegionChange={handleRegionChange}
                  onComunaChange={handleComunaChange}
                />

                <AmenitiesForm
                  amenities={availableAmenities}
                  selectedAmenities={formData.amenities}
                  onAmenityToggle={handleAmenityToggle}
                />

                <FileUploadsForm
                  utilityBill={formData.utilityBill}
                  propertyImages={formData.propertyImages}
                  utilityBillPreview={utilityBillPreview}
                  imagesPreviews={imagesPreviews}
                  onUtilityBillChange={handleUtilityBillChange}
                  onImagesChange={handleImagesChange}
                />
              </form>

              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-neutral-200">
                <Button
                  variant="outline"
                  onClick={() => handleViewChange("dashboard")}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateProperty}
                  className="bg-sage hover:bg-sage/90 text-white"
                >
                  Crear Propiedad
                </Button>
              </div>
            </div>
          </div>
        );

      case "profile":
        return <LandlordProfile />;

      default:
        return <LandlordProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar 
        currentView={currentView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
      />
      <div className="ml-64">
        <main className="p-8">
          {renderContent()}
        </main>
      </div>
      
      {/* Loaders */}
      {isCreating && (
        <PropertyCreationLoader
          status={creationStatus || "loading"}
          errorMessages={errorMessages}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
