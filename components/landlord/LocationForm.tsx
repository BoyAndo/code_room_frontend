"use client";

import { useState, memo, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";
import { PropertyFormData } from "@/types/property";

// Importaciones de Google Maps
import { useJsApiLoader, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';

// Definición del estilo y centro por defecto
const containerStyle = { width: "100%", height: "300px", borderRadius: "8px" };
const defaultCenter = { lat: -33.447487, lng: -70.673676 }; // Santiago, Chile
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places'];


interface LocationFormProps {
    // Asegúrate de que tu tipo PropertyFormData en property.ts tenga 'latitude' y 'longitude'
    formData: PropertyFormData & { latitude: number | null; longitude: number | null }; 
    selectedRegionId: number;
    selectedComunaId: number;
    onFieldChange: (field: keyof PropertyFormData | 'latitude' | 'longitude', value: any) => void;
    onRegionChange: (regionId: number | null, regionName?: string | null) => void;
    onComunaChange: (comunaId: number | null, comunaName?: string | null) => void;
}

// 🔑 Extraer la clave API una sola vez al cargar el módulo
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;


export const LocationForm = memo(function LocationForm({
    formData,
    selectedRegionId,
    selectedComunaId,
    onFieldChange,
    onRegionChange,
    onComunaChange,
}: LocationFormProps) {
    const { address, latitude, longitude } = formData;

    // 1. Cargar el script de Google Maps API
    const { isLoaded, loadError } = useJsApiLoader({
        // 🔑 Usar la constante de la clave API
        googleMapsApiKey: API_KEY, 
        libraries: libraries,
        language: 'es',
        region: 'cl',
    });

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

    // 🔑 Bloque de Carga y Error de API
    // Si la clave no está definida en .env, mostramos un error de configuración.
    if (!API_KEY) {
        return (
            <div className="text-red-600 p-4 border border-red-300 bg-red-50 rounded-lg">
                ❌ Error de Configuración: La clave API de Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) no está definida.
            </div>
        );
    }
    
    // Si la API falló la carga (ej: restricciones de clave/dominio/servicios)
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
            
            {/* 4. Visualización del Mapa con Pin Rojo */}
            <div className="pt-4">
                <Label htmlFor="map">Ubicación Geocodificada</Label>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={pinPosition ? 15 : 10}
                >
                    {pinPosition && (
                        <Marker 
                            position={pinPosition} 
                            title={address}
                            icon={{
                                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                            }}
                        />
                    )}
                </GoogleMap>
            </div>
        </div>
    );
});