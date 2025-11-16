"use client";

import { useState, memo, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";
import { PropertyFormData } from "@/types/property";

// Importaciones de Google Maps
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";

// Definición del estilo y centro por defecto
const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
  border: "1px solid #e5e5e5",
};
const defaultCenter = { lat: -33.447487, lng: -70.673676 }; // Santiago, Chile

interface LocationFormProps {
  formData: PropertyFormData & {
    latitude: number | null;
    longitude: number | null;
  };
  selectedRegionId: number;
  selectedComunaId: number;
  onFieldChange: (
    field: keyof PropertyFormData | "latitude" | "longitude",
    value: any
  ) => void;
  onRegionChange: (regionId: number | null, regionName?: string | null) => void;
  onComunaChange: (comunaId: number | null, comunaName?: string | null) => void;
  readOnlyAddress?: boolean;
}

export const LocationForm = memo(function LocationForm({
  formData,
  selectedRegionId,
  selectedComunaId,
  onFieldChange,
  onRegionChange,
  onComunaChange,
  readOnlyAddress = false,
}: LocationFormProps) {
  const { address, latitude, longitude } = formData;

  // 1. Usar el contexto global de Google Maps
  const { isLoaded, loadError } = useGoogleMaps();

  // Estado para manejar la instancia de Autocomplete
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // 2. Calcular la posición central con validación
  const center = useMemo(() => {
    if (
      latitude &&
      longitude &&
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      isFinite(latitude) &&
      isFinite(longitude)
    ) {
      return { lat: latitude, lng: longitude };
    }
    return defaultCenter;
  }, [latitude, longitude]);

  // 3. Validar pinPosition
  const pinPosition = useMemo(() => {
    if (
      latitude &&
      longitude &&
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      isFinite(latitude) &&
      isFinite(longitude)
    ) {
      return { lat: latitude, lng: longitude };
    }
    return null;
  }, [latitude, longitude]);

  // 4. Handler al seleccionar una dirección del Autocomplete
  const handlePlaceSelect = useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      const newAddress = place.formatted_address || place.name || "";

      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Validar coordenadas antes de actualizar
        if (isFinite(lat) && isFinite(lng)) {
          onFieldChange("address", newAddress);
          onFieldChange("latitude", lat);
          onFieldChange("longitude", lng);
        }
      }
    }
  }, [autocomplete, onFieldChange]);

  // 5. Handler cuando el usuario arrastra el marcador
  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        // Validar coordenadas antes de actualizar
        if (isFinite(lat) && isFinite(lng)) {
          console.log("📍 Marcador movido a:", { lat, lng });
          onFieldChange("latitude", lat);
          onFieldChange("longitude", lng);
        }
      }
    },
    [onFieldChange]
  );

  // 6. Handler cuando el usuario hace doble click en el mapa
  const handleMapDoubleClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        // Validar coordenadas antes de actualizar
        if (isFinite(lat) && isFinite(lng)) {
          console.log("🖱️ Doble click en el mapa:", { lat, lng });
          onFieldChange("latitude", lat);
          onFieldChange("longitude", lng);
        }
      }
    },
    [onFieldChange]
  );

  const handleInputChange = useCallback(
    (field: keyof PropertyFormData | "latitude" | "longitude") =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onFieldChange(field, value);

        // Si el campo de dirección cambia, limpia las coordenadas
        if (field === "address" && latitude !== null) {
          onFieldChange("latitude", null);
          onFieldChange("longitude", null);
        }
      },
    [onFieldChange, latitude]
  );

  // Handlers para el mapa
  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const handleMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // 🔑 Manejo de errores de carga de Google Maps
  if (loadError) {
    console.error("Error al cargar Google Maps:", loadError);
    return (
      <div className="text-red-600 p-4 border border-red-300 bg-red-50 rounded-lg">
        ⚠️ Error de API: Revisa si tu clave de Google Maps es válida y si las
        APIs "Maps JavaScript API" y "Places API" están habilitadas.
      </div>
    );
  }

  // Mientras carga
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-[300px] border border-neutral-200 rounded-lg bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage mx-auto mb-2"></div>
          <p className="text-neutral-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!readOnlyAddress && (
        <>
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Ubicación
          </h3>

          <div>
            <Label htmlFor="address">Dirección completa *</Label>
            <Autocomplete
              onLoad={setAutocomplete}
              onPlaceChanged={handlePlaceSelect}
              options={{
                componentRestrictions: { country: "cl" },
                types: ["address"],
              }}
            >
              <Input
                id="address"
                value={address || ""}
                onChange={handleInputChange("address")}
                placeholder="Av. Principal 123, Pudahuel, Región Metropolitana"
                className="border-sage/30 focus:border-sage focus:ring-sage/20"
                autoComplete="street-address"
              />
            </Autocomplete>
          </div>

          <RegionCommuneSelect
            selectedRegionId={selectedRegionId}
            selectedComunaId={selectedComunaId}
            onRegionChange={onRegionChange}
            onComunaChange={onComunaChange}
          />
        </>
      )}

      {/* Visualización del Mapa con Street View */}
      <div className="pt-4">
        <Label htmlFor="map">
          {readOnlyAddress
            ? "Ajustar ubicación exacta en el mapa"
            : "Ubicación en el Mapa"}
        </Label>
        <p className="text-sm text-neutral-600 mb-2 flex items-center space-x-1">
          <span>📍</span>
          <span>
            {pinPosition
              ? "Arrastra el marcador para ajustar la ubicación exacta, o haz doble click en el mapa para reposicionarlo"
              : readOnlyAddress
              ? "Haz doble click en el mapa para colocar el marcador en la ubicación exacta de tu propiedad"
              : "Ingresa una dirección arriba o haz doble click en el mapa para colocar el marcador"}
          </span>
        </p>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={pinPosition ? 15 : 10}
          options={{
            // 🔥 STREET VIEW ACTIVADO Y CONFIGURADO
            streetViewControl: true,
            streetViewControlOptions: {
              position: google.maps.ControlPosition.RIGHT_BOTTOM,
            },
            mapTypeControl: true,
            mapTypeControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT,
            },
            fullscreenControl: true,
            fullscreenControlOptions: {
              position: google.maps.ControlPosition.RIGHT_TOP,
            },
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_CENTER,
            },
            gestureHandling: "greedy",
            styles: [
              {
                featureType: "poi.business",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "transit",
                elementType: "labels.icon",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
          onDblClick={handleMapDoubleClick}
          onLoad={handleMapLoad}
          onUnmount={handleMapUnmount}
        >
          {pinPosition && (
            <Marker
              position={pinPosition}
              title={address || "Ubicación de la propiedad"}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              icon={{
                url:
                  "data:image/svg+xml;base64," +
                  btoa(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 2C11.58 2 8 5.58 8 10C8 17 16 30 16 30C16 30 24 17 24 10C24 5.58 20.42 2 16 2Z" fill="#D4AF37"/>
                    <path d="M16 14C17.1046 14 18 13.1046 18 12C18 10.8954 17.1046 10 16 10C14.8954 10 14 10.8954 14 12C14 13.1046 14.8954 14 16 14Z" fill="white"/>
                    <path d="M16 2C11.58 2 8 5.58 8 10C8 17 16 30 16 30C16 30 24 17 24 10C24 5.58 20.42 2 16 2Z" stroke="#1a5632" stroke-width="1.5"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 32),
              }}
            />
          )}
        </GoogleMap>

        {pinPosition && (
          <div className="mt-2">
            <p className="text-xs text-neutral-500">
              Coordenadas actuales: {latitude?.toFixed(6)},{" "}
              {longitude?.toFixed(6)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              💡 Usa el control de Street View (hombrecito naranja) para
              explorar la vista de calle
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
