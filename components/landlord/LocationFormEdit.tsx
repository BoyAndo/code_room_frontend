"use client";

import { PropertyFormData } from "@/types/property";
import { memo } from "react";

interface LocationFormEditProps {
  formData: PropertyFormData;
}

export const LocationFormEdit = memo(function LocationFormEdit({
  formData,
}: LocationFormEditProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Ubicación Validada
      </h3>

      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-2">
        <div>
          <p className="text-sm text-neutral-600">
            <span className="font-medium">Dirección:</span> {formData.address}
          </p>
        </div>
        <p className="text-xs text-neutral-500 mt-2 pt-2 border-t border-neutral-300">
          ℹ️ La ubicación no se puede modificar porque está validada con la
          cuenta de servicios
        </p>
      </div>
    </div>
  );
});
