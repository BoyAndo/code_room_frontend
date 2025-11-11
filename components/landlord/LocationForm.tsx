"use client";

import { useState, memo, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";
import { PropertyFormData } from "@/types/property";

// Importaciones de Google Maps
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";

// Definición del estilo y centro por defecto
const containerStyle = { width: "100%", height: "300px", borderRadius: "8px" };
const defaultCenter = { lat: -33.447487, lng: -70.673676 }; // Santiago, Chile


interface LocationFormProps {
    // Asegúrate de que tu tipo PropertyFormData en property.ts tenga 'latitude' y 'longitude'
    formData: PropertyFormData & { latitude: number | null; longitude: number | null }; 
    selectedRegionId: number;
    selectedComunaId: number;
    onFieldChange: (field: keyof PropertyFormData | 'latitude' | 'longitude', value: any) => void;
    onRegionChange: (regionId: number | null, regionName?: string | null) => void;
    onComunaChange: (comunaId: number | null, comunaName?: string | null) => void;
    readOnlyAddress?: boolean; // Nueva prop para modo edición
}

export const LocationForm = memo(function LocationForm({
    formData,
    selectedRegionId,
    selectedComunaId,
    onFieldChange,
    onRegionChange,
    onComunaChange,
    readOnlyAddress = false, // Por defecto es editable
}: LocationFormProps) {
    const { address, latitude, longitude } = formData;

    // 1. Usar el contexto global de Google Maps
    const { isLoaded, loadError } = useGoogleMaps();

    // Estado para manejar la instancia de Autocomplete
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

    // 2. Calcular la posición central
    const center = useMemo(() => {
        if (latitude && longitude) {
            return { lat: latitude, lng: longitude };
        }
        return defaultCenter; 
    }, [latitude, longitude]);

    // 3. Handler al seleccionar una dirección del Autocomplete
    const handlePlaceSelect = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            const newAddress = place.formatted_address || place.name || '';
            
            if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                
                // ACTUALIZAR ADDRESS y COORDENADAS en formData
                onFieldChange("address", newAddress);
                onFieldChange("latitude", lat);
                onFieldChange("longitude", lng);
            }
        }
    };

    // 4. Handler cuando el usuario arrastra el marcador
    const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            
            console.log('📍 Marcador movido a:', { lat, lng });
            
            // Actualizar las coordenadas en el formData
            onFieldChange("latitude", lat);
            onFieldChange("longitude", lng);
        }
    }, [onFieldChange]);

    // 5. Handler cuando el usuario hace doble click en el mapa
    const handleMapDoubleClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            
            console.log('🖱️ Doble click en el mapa:', { lat, lng });
            
            // Colocar el marcador en la posición del doble click
            onFieldChange("latitude", lat);
            onFieldChange("longitude", lng);
        }
    }, [onFieldChange]);


    const handleInputChange = useCallback(
        (field: keyof PropertyFormData | 'latitude' | 'longitude') =>
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

    // 🔑 Manejo de errores de carga de Google Maps
    if (loadError) {
        console.error("Error al cargar Google Maps:", loadError);
        return (
            <div className="text-red-600 p-4 border border-red-300 bg-red-50 rounded-lg">
                ⚠️ Error de API: Revisa si tu clave de Google Maps es válida y si las APIs "Maps JavaScript API" y "Places API" están habilitadas.
            </div>
        );
    }
    
    // Mientras carga
    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center h-[300px] border border-neutral-200 rounded-lg">
                Cargando formulario de ubicación...
            </div>
        );
    }


    const pinPosition = latitude && longitude ? { lat: latitude, lng: longitude } : null;
    
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
                                componentRestrictions: { country: 'cl' },
                                types: ['address'],
                            }}
                        >
                            <Input
                                id="address"
                                value={address}
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
            
            {/* 5. Visualización del Mapa con Pin Arrastrable */}
            <div className="pt-4">
                <Label htmlFor="map">
                    {readOnlyAddress ? "Ajustar ubicación exacta en el mapa" : "Ubicación en el Mapa"}
                </Label>
                <p className="text-sm text-neutral-600 mb-2 flex items-center space-x-1">
                    <span>📍</span>
                    <span>
                        {pinPosition 
                            ? "Arrastra el marcador rojo para ajustar la ubicación exacta, o haz doble click en el mapa para reposicionarlo" 
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
                        streetViewControl: false,
                        mapTypeControl: true,
                        fullscreenControl: true,
                    }}
                    onDblClick={handleMapDoubleClick}
                >
                    {pinPosition && (
                        <Marker 
                            position={pinPosition} 
                            title={address}
                            draggable={true}
                            onDragEnd={handleMarkerDragEnd}
                            icon={{
                                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                                scaledSize: new window.google.maps.Size(40, 40),
                            }}
                        />
                    )}
                </GoogleMap>
                {pinPosition && (
                    <p className="text-xs text-neutral-500 mt-2">
                        Coordenadas actuales: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                    </p>
                )}
            </div>
        </div>
    );
});