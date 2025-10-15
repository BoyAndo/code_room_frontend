"use client";

import { memo } from "react";
import {
  Loader2,
  FileEdit,
  CheckCircle2,
  Image,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyUpdateLoaderProps {
  status: "loading" | "success" | "error";
  errorMessages?: string[];
  onClose?: () => void;
}

export const PropertyUpdateLoader = memo(function PropertyUpdateLoader({
  status,
  errorMessages = [],
  onClose,
}: PropertyUpdateLoaderProps) {
  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
        {/* Título */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              {isLoading && (
                <>
                  <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-sage animate-spin" />
                  </div>
                  <div className="absolute inset-0 bg-sage/20 rounded-full animate-ping" />
                </>
              )}
              {isSuccess && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              )}
              {isError && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isLoading && "Actualizando tu propiedad"}
            {isSuccess && "¡Propiedad actualizada!"}
            {isError && "Error al actualizar"}
          </h2>
          <p className="text-sm text-gray-500">
            {isLoading && "Guardando los cambios realizados"}
            {isSuccess && "Los cambios se han guardado correctamente."}
            {isError && "No se pudo completar la actualización"}
          </p>
        </div>

        {/* Contenido según el estado */}
        {isLoading && (
          <>
            {/* Pasos del proceso */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Validando cambios</p>
                  <p className="text-xs text-gray-500">
                    Verificando información actualizada
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                    <FileEdit className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Actualizando datos
                  </p>
                  <p className="text-xs text-gray-500">
                    Guardando cambios en la base de datos
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Image className="w-5 h-5 text-purple-600 animate-pulse" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Procesando imágenes
                  </p>
                  <p className="text-xs text-gray-500">
                    Optimizando nuevas imágenes
                  </p>
                </div>
              </div>
            </div>

            {/* Barra de progreso animada */}
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sage to-sage-dark rounded-full animate-pulse-slow relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              <p className="text-xs text-center text-gray-500">
                Actualizando tu propiedad...
              </p>
            </div>
          </>
        )}

        {isSuccess && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Los cambios han sido guardados exitosamente. Tu propiedad está
                actualizada en la plataforma.
              </p>
            </div>
            <Button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Entendido
            </Button>
          </div>
        )}

        {isError && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-red-900">
                    Se encontraron los siguientes problemas:
                  </p>
                  <ul className="space-y-2">
                    {errorMessages.map((error, index) => (
                      <li
                        key={index}
                        className="text-sm text-red-800 flex items-start space-x-2"
                      >
                        <span className="font-bold flex-shrink-0">
                          {index + 1}.
                        </span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <Button onClick={onClose} variant="destructive" className="w-full">
              Cerrar y corregir
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});
