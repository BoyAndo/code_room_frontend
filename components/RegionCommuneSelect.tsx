"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, Region, Comuna } from "@/lib/api";

interface RegionCommuneSelectProps {
  selectedRegionId?: number | null;
  selectedComunaId?: number | null;
  onRegionChange: (regionId: number | null, regionName?: string | null) => void;
  onComunaChange: (comunaId: number | null, comunaName?: string | null) => void;
  required?: boolean;
  className?: string;
}

export function RegionCommuneSelect({
  selectedRegionId,
  selectedComunaId,
  onRegionChange,
  onComunaChange,
  required = false,
  className = "",
}: RegionCommuneSelectProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingComunas, setLoadingComunas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar regiones al montar el componente
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoadingRegions(true);
        const regionsData = await api.getRegions();
        setRegions(regionsData);
        setError(null);
      } catch (error) {
        console.error("Error loading regions:", error);
        setError("Error al cargar las regiones");
      } finally {
        setLoadingRegions(false);
      }
    };

    fetchRegions();
  }, []);

  // Cargar comunas cuando cambia la región seleccionada
  useEffect(() => {
    const fetchComunas = async () => {
      if (!selectedRegionId) {
        setComunas([]);
        return;
      }

      try {
        setLoadingComunas(true);
        const comunasData = await api.getCommunesByRegion(selectedRegionId);
        setComunas(comunasData);
        setError(null);
      } catch (error) {
        console.error("Error loading comunas:", error);
        setError("Error al cargar las comunas");
        setComunas([]);
      } finally {
        setLoadingComunas(false);
      }
    };

    fetchComunas();
  }, [selectedRegionId]);

  // Limpiar comuna seleccionada cuando cambia la región
  useEffect(() => {
    if (selectedRegionId && selectedComunaId) {
      // Verificar si la comuna seleccionada pertenece a la región actual
      const comunaExistsInCurrentRegion = comunas.find(
        (comuna) => comuna.id === selectedComunaId
      );
      if (!comunaExistsInCurrentRegion) {
        onComunaChange(null, null);
      }
    }
  }, [selectedRegionId, comunas, selectedComunaId, onComunaChange]);

  const handleRegionChange = (value: string) => {
    const regionId = value === "none" ? null : parseInt(value);
    const selectedRegion = regions.find((r) => r.id === regionId);
    const regionName = selectedRegion?.name || null;

    onRegionChange(regionId, regionName);
    // Limpiar la comuna seleccionada cuando cambia la región
    onComunaChange(null, null);
  };

  const handleComunaChange = (value: string) => {
    const comunaId = value === "none" ? null : parseInt(value);
    const selectedComuna = comunas.find((c) => c.id === comunaId);
    const comunaName = selectedComuna?.name || null;

    onComunaChange(comunaId, comunaName);
  };

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selector de Región */}
      <div className="space-y-2">
        <Label htmlFor="region-select">
          Región {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={selectedRegionId?.toString() || ""}
          onValueChange={handleRegionChange}
          disabled={loadingRegions}
        >
          <SelectTrigger id="region-select">
            <SelectValue
              placeholder={
                loadingRegions
                  ? "Cargando regiones..."
                  : "Selecciona una región"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {!required && (
              <SelectItem value="none">
                <span className="text-gray-500">Sin especificar</span>
              </SelectItem>
            )}
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id.toString()}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selector de Comuna */}
      <div className="space-y-2">
        <Label htmlFor="comuna-select">
          Comuna {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={selectedComunaId?.toString() || ""}
          onValueChange={handleComunaChange}
          disabled={!selectedRegionId || loadingComunas}
        >
          <SelectTrigger id="comuna-select">
            <SelectValue
              placeholder={
                !selectedRegionId
                  ? "Primero selecciona una región"
                  : loadingComunas
                  ? "Cargando comunas..."
                  : "Selecciona una comuna"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {!required && selectedRegionId && (
              <SelectItem value="none">
                <span className="text-gray-500">Sin especificar</span>
              </SelectItem>
            )}
            {comunas.map((comuna) => (
              <SelectItem key={comuna.id} value={comuna.id.toString()}>
                {comuna.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Información de ayuda */}
      {!selectedRegionId && (
        <p className="text-sm text-gray-500">
          Selecciona una región para ver las comunas disponibles
        </p>
      )}
    </div>
  );
}
