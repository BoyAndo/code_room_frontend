// LandlordDashboard.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, isLandlord } from "@/contexts/AuthContext";
import { LandlordProfile } from "@/components/landlord/LandlordProfile";
import { Sidebar } from "@/components/landlord/Sidebar";
import { useState, useEffect, useCallback } from "react";
import { Property } from "@/types/property";
import LandlordChatsPage from "@/components/landlord/LandlordChatsPage";

// Importación de componentes necesarios
import { PropertyCard } from "@/components/landlord/PropertyCard";
import { BasicInfoForm } from "@/components/landlord/BasicInfoForm";
import { LocationForm } from "@/components/landlord/LocationForm";
import { AmenitiesForm } from "@/components/landlord/AmenitiesForm";
import { FileUploadsForm } from "@/components/landlord/FileUploadsForm";
import { PropertyCreationLoader } from "@/components/landlord/PropertyCreationLoader";
import { useProperties } from "@/hooks/useProperties";
import { usePropertyForm } from "@/hooks/usePropertyForm";
import { usePropertyEdit } from "@/hooks/usePropertyEdit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Building2,
  TrendingUp,
  DollarSign,
  MessageSquareText, // 💡 CHAT/NOTIFICACIÓN
} from "lucide-react";

// 💡 Componente de chat simulado (deberías crear el real: ChatView)
const ChatView = () => (
  <div className="bg-white p-8 rounded-lg border border-neutral-200">
    <h1 className="text-2xl font-bold text-neutral-800 mb-4">
      💬 Mensajes y Chat
    </h1>
    <p className="text-neutral-600 mb-6">
      Administra tus conversaciones con los interesados en tus propiedades. Aquí
      verías la lista de chats.
    </p>
    <div className="space-y-4">
      {/* Simulación de lista de chats */}
      <div className="p-4 border rounded-lg hover:bg-neutral-50 cursor-pointer">
        <p className="font-semibold">Juan Pérez - Propiedad ID 101</p>
        <p className="text-sm text-neutral-500">
          Último mensaje: ¿Cuándo podemos agendar una visita?
        </p>
      </div>
      <div className="p-4 border rounded-lg hover:bg-neutral-50 cursor-pointer">
        <p className="font-semibold">María López - Propiedad ID 105</p>
        <p className="text-sm text-sage">¡Tienes un mensaje no leído! ✨</p>
      </div>
    </div>
  </div>
);

export default function LandlordDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "dashboard";
  const SidebarComponent: any = Sidebar;
  const currentUserId = user?.id; // ID del landlord actual

  // 💡 CHAT/NOTIFICACIÓN: Estado para el conteo de mensajes no leídos
  const [unreadMessages, setUnreadMessages] = useState(0);

  // 💡 Función para obtener el conteo de mensajes no leídos
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadMessages(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error al obtener mensajes no leídos:", error);
    }
  }, []);

  // 🔧 Estado para edición de propiedades
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);

  // Estados y hooks necesarios para las diferentes vistas
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

  // 🔧 Hook para edición de propiedades
  const {
    formData: editFormData,
    imagesPreviews: editImagesPreviews,
    existingImages,
    isUpdating,
    updateStatus,
    errorMessages: editErrorMessages,
    handleFieldChange: handleEditFieldChange,
    handleAmenityToggle: handleEditAmenityToggle,
    handleImagesChange: handleEditImagesChange,
    handleRemoveImage: handleEditRemoveImage,
    updateProperty,
    closeModal: closeEditModal,
  } = usePropertyEdit(propertyToEdit);

  // 🔧 Función para iniciar la edición de una propiedad
  const handleEditProperty = (property: Property) => {
    setPropertyToEdit(property);
    handleViewChange("edit-property");
  };

  // Efecto para cargar las propiedades cuando sea necesario
  useEffect(() => {
    if (currentView === "dashboard" || currentView === "properties") {
      fetchProperties();
    }
    // 💡 CHAT/NOTIFICACIÓN: Cargar el conteo real de mensajes no leídos
    if (currentView === "dashboard" || currentView === "chat") {
      fetchUnreadCount();
    }
  }, [currentView, fetchProperties, fetchUnreadCount]);

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
      case "edit-property":
        router.push("/profile/landlord?view=edit-property");
        break;
      case "chat": // 💡 CHAT/NOTIFICACIÓN: Nueva vista de chat
        router.push("/profile/landlord?view=chat");
        // No reseteamos a 0 manualmente, el useEffect lo actualizará
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {" "}
              {/* Cambiado a 4 columnas */}
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
              {/* 💡 CHAT/NOTIFICACIÓN: Tarjeta de Mensajes Recientes */}
              <div
                className="bg-white p-6 rounded-lg border border-neutral-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewChange("chat")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">
                      Mensajes No Leídos
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        unreadMessages > 0 ? "text-golden" : "text-neutral-800"
                      }`}
                    >
                      {unreadMessages}
                    </p>
                  </div>
                  <MessageSquareText
                    className={`h-8 w-8 ${
                      unreadMessages > 0
                        ? "text-golden animate-pulse"
                        : "text-sage"
                    }`}
                  />
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
                            parseFloat(property.monthlyRent?.toString() || "0"),
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
                      onEdit={() => handleEditProperty(property)}
                      onDelete={() => requestDeleteProperty(property)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "properties":
        // ... (Contenido de 'properties' sin cambios)
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
                  onEdit={() => handleEditProperty(property)}
                  onDelete={() => requestDeleteProperty(property)}
                />
              ))}
            </div>
          </div>
        );

      case "create-property":
        // ... (Contenido de 'create-property' sin cambios)
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

      case "edit-property":
        // Vista de edición de propiedad
        if (!propertyToEdit) {
          return (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
                <p className="text-neutral-600">
                  No hay propiedad seleccionada para editar
                </p>
                <Button
                  onClick={() => handleViewChange("properties")}
                  className="mt-4 bg-sage hover:bg-sage/90 text-white"
                >
                  Ver Propiedades
                </Button>
              </div>
            </div>
          );
        }

        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-neutral-200 p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-800">
                  Editar Propiedad
                </h1>
                <p className="text-neutral-600">
                  Actualiza la información de tu propiedad
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  ⚠️ Nota: La dirección, región y comuna no se pueden modificar
                  ya que fueron validadas con tu cuenta de servicios.
                </p>
              </div>

              <form className="space-y-8">
                <BasicInfoForm
                  formData={editFormData}
                  onFieldChange={handleEditFieldChange}
                />

                {/* Mostrar ubicación como solo lectura */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Ubicación
                  </h3>

                  {/* Información de dirección no editable */}
                  <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    <p className="text-sm text-neutral-600 mb-2">
                      <strong>Dirección:</strong> {propertyToEdit.address}
                    </p>
                    <p className="text-sm text-neutral-600 mb-2">
                      <strong>Comuna:</strong>{" "}
                      {typeof propertyToEdit.comuna === "string"
                        ? propertyToEdit.comuna
                        : (propertyToEdit.comuna as any)?.name ||
                          propertyToEdit.comunaName ||
                          "N/A"}
                    </p>
                    <p className="text-sm text-neutral-600 mb-2">
                      <strong>Región:</strong>{" "}
                      {typeof propertyToEdit.region === "string"
                        ? propertyToEdit.region
                        : (propertyToEdit.region as any)?.name ||
                          propertyToEdit.regionName ||
                          "N/A"}
                    </p>
                    <p className="text-xs text-neutral-500 italic mt-2">
                      ⚠️ La dirección no se puede modificar (validada con cuenta
                      de servicios)
                    </p>
                  </div>

                  {/* Mapa editable para ajustar coordenadas */}
                  <LocationForm
                    formData={{
                      ...editFormData,
                      address: propertyToEdit.address,
                      latitude: editFormData.latitude ?? null,
                      longitude: editFormData.longitude ?? null,
                    }}
                    selectedRegionId={propertyToEdit.regionId}
                    selectedComunaId={propertyToEdit.comunaId}
                    onFieldChange={handleEditFieldChange}
                    onRegionChange={() => {}} // No se pueden cambiar
                    onComunaChange={() => {}} // No se pueden cambiar
                    readOnlyAddress={true} // Nueva prop para hacer el address readonly
                  />
                </div>

                <AmenitiesForm
                  amenities={availableAmenities}
                  selectedAmenities={editFormData.amenities}
                  onAmenityToggle={handleEditAmenityToggle}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Imágenes
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Imágenes actuales: {existingImages.length}
                  </p>
                  <FileUploadsForm
                    utilityBill={null}
                    propertyImages={editFormData.propertyImages || []}
                    utilityBillPreview={null}
                    imagesPreviews={editImagesPreviews}
                    onUtilityBillChange={() => {}} // No se puede cambiar en edición
                    onImagesChange={handleEditImagesChange}
                    onRemoveImage={handleEditRemoveImage} // Pasar el handler de eliminación
                    hideUtilityBill={true} // Ocultar el campo de cuenta de servicios
                  />
                </div>
              </form>

              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-neutral-200">
                <Button
                  variant="outline"
                  onClick={() => handleViewChange("properties")}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    const success = await updateProperty();
                    if (success) {
                      await fetchProperties();
                      handleViewChange("properties");
                    }
                  }}
                  disabled={isUpdating}
                  className="bg-sage hover:bg-sage/90 text-white"
                >
                  {isUpdating ? "Actualizando..." : "Guardar Cambios"}
                </Button>
              </div>

              {/* Mensajes de error */}
              {editErrorMessages.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-semibold mb-2">Errores:</p>
                  <ul className="list-disc list-inside text-red-700">
                    {editErrorMessages.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case "chat": // 💡 CHAT/NOTIFICACIÓN: Nuevo contenido para la vista de chat
        return <LandlordChatsPage />; // 🚨 Usa el componente real

      case "profile":
        return <LandlordProfile />;

      default:
        return <LandlordProfile />;
    }
  };
  return (
    <div className="min-h-screen bg-neutral-50">
      <SidebarComponent
        currentView={currentView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
        // 💡 CHAT/NOTIFICACIÓN: Pasar el estado de notificación a la Sidebar
        unreadMessagesCount={unreadMessages}
      />
      <div className="ml-64">
        <main className="p-8">{renderContent()}</main>
      </div>

      {/* Loaders */}
      {isCreating && (
        <PropertyCreationLoader
          status={creationStatus || "loading"}
          errorMessages={errorMessages}
          onClose={closeModal}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <AlertDialog
        open={!!propertyToDelete}
        onOpenChange={(open) => !open && cancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              propiedad <strong>&quot;{propertyToDelete?.title}&quot;</strong> y
              todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProperty}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// 💡 CHAT/NOTIFICACIÓN: Definición del propType para la Sidebar
// Si usas TypeScript en la Sidebar, actualiza su interfaz.
// Aquí va la actualización de la Sidebar (asumiendo que es un componente separado):
//
// Componente Sidebar (simulado, solo para mostrar el prop de notificación)
// interface SidebarProps {
//   currentView: string;
//   onViewChange: (view: string) => void;
//   onLogout: () => void;
//   unreadMessagesCount: number; // Nuevo prop
// }
//
// export function Sidebar({ currentView, onViewChange, onLogout, unreadMessagesCount }: SidebarProps) {
//   // ... (Resto del código de Sidebar)
// }
//
