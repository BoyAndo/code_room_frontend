"use client";

import { memo } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from "@/types/property";

interface DeletePropertyModalProps {
  property: Property | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeletePropertyModal = memo(function DeletePropertyModal({
  property,
  isDeleting,
  onConfirm,
  onCancel,
}: DeletePropertyModalProps) {
  if (!property) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
        {/* Icono de advertencia */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Título y mensaje */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            ¿Eliminar propiedad?
          </h2>
          <p className="text-sm text-gray-600">
            Esta acción no se puede deshacer. La propiedad será eliminada
            permanentemente.
          </p>
        </div>

        {/* Información de la propiedad */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-sm font-medium text-gray-700 min-w-[80px]">
              Título:
            </span>
            <span className="text-sm text-gray-900 font-semibold flex-1">
              {property.title}
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-sm font-medium text-gray-700 min-w-[80px]">
              Dirección:
            </span>
            <span className="text-sm text-gray-600 flex-1">
              {property.address}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            variant="destructive"
            className="flex-1"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Eliminando...
              </>
            ) : (
              "Eliminar propiedad"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});
