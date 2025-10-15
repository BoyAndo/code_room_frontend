"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";
import { PropertyFormData } from "@/types/property";
import { memo, useCallback } from "react";

interface LocationFormProps {
  formData: PropertyFormData;
  selectedRegionId: number;
  selectedComunaId: number;
  onFieldChange: (field: keyof PropertyFormData, value: any) => void;
  onRegionChange: (regionId: number | null, regionName?: string | null) => void;
  onComunaChange: (comunaId: number | null, comunaName?: string | null) => void;
}

export const LocationForm = memo(function LocationForm({
  formData,
  selectedRegionId,
  selectedComunaId,
  onFieldChange,
  onRegionChange,
  onComunaChange,
}: LocationFormProps) {
  const handleInputChange = useCallback(
    (field: keyof PropertyFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onFieldChange(field, e.target.value);
      },
    [onFieldChange]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Ubicación
      </h3>

      <div>
        <Label htmlFor="address">Dirección completa *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={handleInputChange("address")}
          placeholder="Av. Principal 123, Pudahuel, Región Metropolitana"
          className="border-sage/30 focus:border-sage focus:ring-sage/20"
          autoComplete="street-address"
        />
      </div>

      <RegionCommuneSelect
        selectedRegionId={selectedRegionId}
        selectedComunaId={selectedComunaId}
        onRegionChange={onRegionChange}
        onComunaChange={onComunaChange}
        required={true}
        className="border-sage/30 focus:border-sage focus:ring-sage/20"
      />
    </div>
  );
});
