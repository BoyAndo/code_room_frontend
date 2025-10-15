"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useAuth, isLandlord } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Property } from "@/types/property";

// Componentes personalizados
import { Sidebar } from "@/components/landlord/Sidebar";
import { PropertyCard } from "@/components/landlord/PropertyCard";
import { BasicInfoForm } from "@/components/landlord/BasicInfoForm";
import { LocationForm } from "@/components/landlord/LocationForm";
import { LocationFormEdit } from "@/components/landlord/LocationFormEdit";
import { AmenitiesForm } from "@/components/landlord/AmenitiesForm";
import { FileUploadsForm } from "@/components/landlord/FileUploadsForm";
import { FileUploadsFormEdit } from "@/components/landlord/FileUploadsFormEdit";
import { PropertyCreationLoader } from "@/components/landlord/PropertyCreationLoader";
import { PropertyUpdateLoader } from "@/components/landlord/PropertyUpdateLoader";
import { DeletePropertyModal } from "@/components/landlord/DeletePropertyModal";

// Hooks personalizados
import { useProperties } from "@/hooks/useProperties";
import { usePropertyForm } from "@/hooks/usePropertyForm";
import { usePropertyEdit } from "@/hooks/usePropertyEdit";

export default function LandlordDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Estados principales
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  // Hooks personalizados
  const {
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

  // Hook para editar propiedad
  const {
    formData: editFormData,
    imagesPreviews: editImagesPreviews,
    isUpdating,
    updateStatus,
    errorMessages: updateErrorMessages,
    handleFieldChange: editHandleFieldChange,
    handleAmenityToggle: editHandleAmenityToggle,
    handleImagesChange: editHandleImagesChange,
    handleRemoveImage: editHandleRemoveImage,
    updateProperty,
    closeModal: closeUpdateModal,
  } = usePropertyEdit(selectedProperty);

  // Handlers
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleCreateProperty = async () => {
    const success = await createProperty();
    if (success) {
      setCurrentView("dashboard");
      fetchProperties();
    }
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setCurrentView("edit-property");
  };

  const handleUpdateProperty = async () => {
    const success = await updateProperty();
    if (success) {
      setCurrentView("dashboard");
      setSelectedProperty(null);
      fetchProperties();
    }
  };

  const handleCancelForm = () => {
    resetForm();
    setCurrentView("dashboard");
  };

  const handleCancelEdit = () => {
    setSelectedProperty(null);
    setCurrentView("dashboard");
  };

  // Loading state
  if (!user || !isLandlord(user)) {
    return (
      <div className="min-h-screen bg-cream/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-8">
          {/* Dashboard View */}
          {currentView === "dashboard" && (
            <div className="space-y-8">
              {/* Header */}
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
                  onClick={() => setCurrentView("create-property")}
                  className="bg-sage hover:bg-sage/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Propiedad
                </Button>
              </div>

              {/* Stats Cards */}
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
                        $
                        {properties
                          .reduce(
                            (total, property) =>
                              total +
                              parseFloat(
                                property.monthlyRent?.toString() || "0"
                              ),
                            0
                          )
                          .toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-sage" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg border border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                  Acciones Rápidas
                </h2>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => setCurrentView("create-property")}
                    className="bg-sage hover:bg-sage/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Propiedad
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView("properties")}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Ver Todas las Propiedades
                  </Button>
                </div>
              </div>

              {/* Recent Properties */}
              {properties.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-neutral-800">
                      Propiedades Recientes
                    </h2>
                    <button
                      onClick={() => setCurrentView("properties")}
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
                        onEdit={handleEditProperty}
                        onDelete={() => requestDeleteProperty(property)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Property View */}
          {currentView === "create-property" && (
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
                    formData={formData}
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
                  <Button variant="outline" onClick={handleCancelForm}>
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
          )}

          {/* Edit Property View */}
          {currentView === "edit-property" && selectedProperty && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg border border-neutral-200 p-8">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-neutral-800">
                    Editar Propiedad
                  </h1>
                  <p className="text-neutral-600">
                    Actualiza la información de tu propiedad
                  </p>
                </div>

                <form className="space-y-8">
                  <BasicInfoForm
                    formData={editFormData}
                    onFieldChange={editHandleFieldChange}
                  />

                  <LocationFormEdit formData={editFormData} />

                  <AmenitiesForm
                    amenities={availableAmenities}
                    selectedAmenities={editFormData.amenities}
                    onAmenityToggle={editHandleAmenityToggle}
                  />

                  <FileUploadsFormEdit
                    propertyImages={editFormData.propertyImages}
                    imagesPreviews={editImagesPreviews}
                    onImagesChange={editHandleImagesChange}
                    onRemoveImage={editHandleRemoveImage}
                  />
                </form>

                <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-neutral-200">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUpdateProperty}
                    className="bg-sage hover:bg-sage/90 text-white"
                  >
                    Actualizar Propiedad
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Properties List View */}
          {currentView === "properties" && (
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
                  onClick={() => setCurrentView("create-property")}
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
                    onEdit={handleEditProperty}
                    onDelete={() => requestDeleteProperty(property)}
                  />
                ))}
              </div>

              {filteredProperties.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="mx-auto h-12 w-12 text-neutral-400" />
                  <h3 className="mt-2 text-sm font-medium text-neutral-900">
                    No se encontraron propiedades
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {searchTerm
                      ? "Intenta con diferentes términos de búsqueda"
                      : "Comienza creando tu primera propiedad"}
                  </p>
                  {!searchTerm && (
                    <div className="mt-6">
                      <Button
                        onClick={() => setCurrentView("create-property")}
                        className="bg-sage hover:bg-sage/90 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Primera Propiedad
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
      {isUpdating && (
        <PropertyUpdateLoader
          status={updateStatus || "loading"}
          errorMessages={updateErrorMessages}
          onClose={closeUpdateModal}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {propertyToDelete && (
        <DeletePropertyModal
          property={propertyToDelete}
          isDeleting={isDeleting}
          onConfirm={confirmDeleteProperty}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
