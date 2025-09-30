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

      <div className="grid grid-cols-2 gap-4">
        <RegionCommuneSelect
          selectedRegionId={selectedRegionId}
          selectedComunaId={selectedComunaId}
          onRegionChange={onRegionChange}
          onComunaChange={onComunaChange}
          required={true}
          className="border-sage/30 focus:border-sage focus:ring-sage/20"
        />
        <div>
          <Label htmlFor="zipCode">Código postal</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange("zipCode")}
            placeholder="1234567"
            className="border-sage/30 focus:border-sage focus:ring-sage/20"
            autoComplete="postal-code"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitud (opcional)</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={handleInputChange("latitude")}
            placeholder="-33.4372"
            className="border-sage/30 focus:border-sage focus:ring-sage/20"
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitud (opcional)</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={handleInputChange("longitude")}
            placeholder="-70.6506"
            className="border-sage/30 focus:border-sage focus:ring-sage/20"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
});
