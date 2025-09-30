"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { memo, useCallback } from "react";

interface FileUploadsFormProps {
  utilityBill: File | null;
  propertyImages: File[];
  utilityBillPreview: string | null;
  imagesPreviews: string[];
  onUtilityBillChange: (file: File | null, preview: string | null) => void;
  onImagesChange: (files: File[], previews: string[]) => void;
  onRemoveImage?: (index: number) => void;
}

export const FileUploadsForm = memo(function FileUploadsForm({
  utilityBill,
  propertyImages,
  utilityBillPreview,
  imagesPreviews,
  onUtilityBillChange,
  onImagesChange,
  onRemoveImage,
}: FileUploadsFormProps) {
  const handleUtilityBillChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            onUtilityBillChange(file, e.target?.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          onUtilityBillChange(file, null);
        }
      } else {
        onUtilityBillChange(null, null);
      }
    },
    [onUtilityBillChange]
  );

  const handleImagesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFiles = Array.from(e.target.files || []);
      if (newFiles.length === 0) return;

      // Combinar archivos existentes con los nuevos
      const combinedFiles = [...propertyImages, ...newFiles];

      if (combinedFiles.length > 5) {
        alert("Máximo 5 imágenes permitidas");
        return;
      }

      const newPreviews: string[] = [];
      let loadedCount = 0;

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          loadedCount++;
          if (loadedCount === newFiles.length) {
            // Combinar previews existentes con los nuevos
            const combinedPreviews = [...imagesPreviews, ...newPreviews];
            onImagesChange(combinedFiles, combinedPreviews);
          }
        };
        reader.readAsDataURL(file);
      });

      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
      e.target.value = "";
    },
    [onImagesChange, propertyImages, imagesPreviews]
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      const newFiles = propertyImages.filter((_, i) => i !== index);
      const newPreviews = imagesPreviews.filter((_, i) => i !== index);
      onImagesChange(newFiles, newPreviews);

      if (onRemoveImage) {
        onRemoveImage(index);
      }
    },
    [propertyImages, imagesPreviews, onImagesChange, onRemoveImage]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Documentos Requeridos
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label htmlFor="utilityBill">Cuenta de servicios *</Label>
          <Input
            id="utilityBill"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleUtilityBillChange}
            className="border-sage/30 focus:border-sage focus:ring-sage/20"
          />
          {utilityBillPreview && (
            <div className="mt-2">
              <img
                src={utilityBillPreview}
                alt="Preview cuenta de servicios"
                className="w-24 h-24 object-cover rounded border"
              />
            </div>
          )}
          {utilityBill && (
            <p className="text-sm text-gray-600 mt-1">
              Archivo: {utilityBill.name}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="propertyImages">Imágenes * (1-5 fotos)</Label>
          <Input
            id="propertyImages"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            onChange={handleImagesChange}
            className="border-sage/30 focus:border-sage focus:ring-sage/20"
          />
          {imagesPreviews.length > 0 && (
            <div className="mt-2 grid grid-cols-5 gap-2">
              {imagesPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar imagen"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Seleccionadas: {propertyImages.length}/5
          </p>
        </div>
      </div>
    </div>
  );
});
