"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { memo, useCallback } from "react";

interface FileUploadsFormEditProps {
  propertyImages: File[];
  imagesPreviews: string[];
  onImagesChange: (files: File[], previews: string[]) => void;
  onRemoveImage?: (index: number) => void;
}

export const FileUploadsFormEdit = memo(function FileUploadsFormEdit({
  propertyImages,
  imagesPreviews,
  onImagesChange,
  onRemoveImage,
}: FileUploadsFormEditProps) {
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
        Imágenes de la Propiedad
      </h3>

      <div>
        <Label htmlFor="propertyImages">Imágenes (1-5 fotos)</Label>
        <p className="text-sm text-neutral-500 mb-2">
          Puedes agregar más imágenes o eliminar las existentes
        </p>
        <Input
          id="propertyImages"
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleImagesChange}
          className="border-sage/30 focus:border-sage focus:ring-sage/20"
        />
        {imagesPreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-5 gap-3">
            {imagesPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded border border-neutral-200 transition-all group-hover:border-sage"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title="Eliminar imagen"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Imágenes seleccionadas: {propertyImages.length}/5
        </p>
      </div>
    </div>
  );
});
