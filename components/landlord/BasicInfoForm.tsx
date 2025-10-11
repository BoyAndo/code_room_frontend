"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyFormData } from "@/types/property";
import { memo, useCallback } from "react";

interface BasicInfoFormProps {
  formData: PropertyFormData;
  onFieldChange: (field: keyof PropertyFormData, value: any) => void;
}

export const BasicInfoForm = memo(function BasicInfoForm({
  formData,
  onFieldChange,
}: BasicInfoFormProps) {
  const handleInputChange = useCallback(
    (field: keyof PropertyFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onFieldChange(field, e.target.value);
      },
    [onFieldChange]
  );

  const handleNumberInputChange = useCallback(
    (field: keyof PropertyFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        onFieldChange(field, value);
      },
    [onFieldChange]
  );

  const handleSelectChange = useCallback(
    (field: keyof PropertyFormData) => (value: string) => {
      onFieldChange(field, value);
    },
    [onFieldChange]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Información Básica
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Título de la propiedad *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={handleInputChange("title")}
            placeholder="Hermosa casa en Providencia"
            className="border-sage/30 focus:border-sage focus:ring-sage/20"
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="propertyType">Tipo de propiedad *</Label>
          <Select
            value={formData.propertyType}
            onValueChange={handleSelectChange("propertyType")}
            defaultValue={formData.propertyType}
          >
            <SelectTrigger className="border-sage/30 focus:border-sage focus:ring-sage/20">
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HOUSE">Casa</SelectItem>
              <SelectItem value="APARTMENT">Departamento</SelectItem>
              <SelectItem value="ROOM">Pieza</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={handleInputChange("description")}
          placeholder="Describe tu propiedad..."
          className="min-h-[80px] border-sage/30 focus:border-sage focus:ring-sage/20"
          rows={3}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthlyRent">Renta mensual (CLP) *</Label>
          <Input
            id="monthlyRent"
            value={formData.monthlyRent}
            onChange={handleInputChange("monthlyRent")}
            placeholder="250000"
            className="border-sage/30 focus:border-sage focus:ring-sage/20"
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="squareMeters">Metros cuadrados</Label>
          <Input
            id="squareMeters"
            type="number"
            min="1"
            value={formData.squareMeters}
            onChange={handleInputChange("squareMeters")}
            placeholder="60"
            className="border-sage/30 focus:border-sage focus:ring-sage/20"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bedrooms">Dormitorios *</Label>
          <Input
            id="bedrooms"
            type="number"
            min="1"
            max="10"
            value={formData.bedrooms}
            onChange={handleNumberInputChange("bedrooms")}
            className="border-sage/30 focus:border-sage focus:ring-sage/20"
          />
        </div>
        <div>
          <Label htmlFor="bathrooms">Baños *</Label>
          <Input
            id="bathrooms"
            type="number"
            min="1"
            max="10"
            value={formData.bathrooms}
            onChange={handleNumberInputChange("bathrooms")}
            className="border-sage/30 focus:border-sage focus:ring-sage/20"
          />
        </div>
      </div>
    </div>
  );
});
