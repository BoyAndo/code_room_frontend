"use client";

import { Label } from "@/components/ui/label";
import { Amenity } from "@/types/property";
import { memo, useCallback } from "react";

interface AmenitiesFormProps {
  amenities: Amenity[];
  selectedAmenities: number[];
  onAmenityToggle: (amenityId: number) => void;
}

export const AmenitiesForm = memo(function AmenitiesForm({
  amenities,
  selectedAmenities,
  onAmenityToggle,
}: AmenitiesFormProps) {
  const handleAmenityChange = useCallback(
    (amenityId: number) => {
      onAmenityToggle(amenityId);
    },
    [onAmenityToggle]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Amenidades
      </h3>
      <div>
        <Label>Selecciona hasta 3 amenidades *</Label>
        {amenities.length === 0 ? (
          <div className="p-4 text-center text-gray-500 border border-sage/30 rounded-md bg-gray-50">
            <p>Cargando amenidades...</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 border border-sage/30 rounded-md bg-gray-50">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`amenity-${amenity.id}`}
                  checked={selectedAmenities.includes(amenity.id)}
                  onChange={() => handleAmenityChange(amenity.id)}
                  disabled={
                    !selectedAmenities.includes(amenity.id) &&
                    selectedAmenities.length >= 3
                  }
                  className="rounded border-sage/30"
                />
                <Label
                  htmlFor={`amenity-${amenity.id}`}
                  className={`text-xs ${
                    !selectedAmenities.includes(amenity.id) &&
                    selectedAmenities.length >= 3
                      ? "text-gray-400"
                      : "text-gray-700"
                  }`}
                >
                  {amenity.name}
                  <span className="text-xs text-gray-500 ml-1">
                    ({amenity.category})
                  </span>
                </Label>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Seleccionadas: {selectedAmenities.length}/3
        </p>
      </div>
    </div>
  );
});
