"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth, isLandlord } from "@/contexts/AuthContext";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import { GoogleMap, Marker } from "@react-google-maps/api";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  Heart,
  MessageCircle,
  CheckCircle2,
  Home,
  User,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Interfaces (las mismas que en search/page.tsx)
interface Amenity {
  id: number;
  name: string;
  category: string;
  icon: string;
}

interface PropertyImage {
  id: number;
  propertyId: number;
  imageUrl: string;
  displayOrder: number;
  altText: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Landlord {
  id: number;
  landlordName: string;
}

interface Property {
  id: number;
  landlordId: number;
  title: string;
  description: string;
  address: string;
  comuna: string;
  region: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  monthlyRent: string;
  isAvailable: boolean;
  utilityBillUrl: string;
  utilityBillValidated: boolean;
  createdAt: string;
  updatedAt: string;
  propertyImages: PropertyImage[];
  images: string[];
  amenities: Amenity[];
  landlord: Landlord;
  latitude?: number | null;
  longitude?: number | null;
}

export default function PropertyPage() {
  const params = useParams();
  const { user } = useAuth();
  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useGoogleMaps();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: -33.447487,
    lng: -70.673676,
  }); // Centro por defecto: Santiago

  // Función para geocodificar la dirección
  const geocodeAddress = async (address: string, comuna: string, region: string) => {
    if (!isMapLoaded || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    const fullAddress = `${address}, ${comuna}, ${region}, Chile`;

    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        setMapCenter({
          lat: location.lat(),
          lng: location.lng(),
        });
        console.log("Geocoded address:", fullAddress, "to", {
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        console.error("Geocoding failed:", status);
      }
    });
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        console.log("Fetching property details for ID:", params.id);
        const API_URL =
          process.env.NEXT_PUBLIC_API_PROPERTIES_URL ||
          "http://localhost:3002/api";
        const response = await apiFetch(
          `${API_URL}/properties/${params.id}/with-landlord`,
          {
            method: "GET",
          }
        );

        console.log("Property details response status:", response.status);
        console.log(
          "Response headers:",
          Object.fromEntries(response.headers.entries())
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result); // Debug log

        // Extraer los datos de la propiedad de la respuesta
        const propertyData = result.data || result;

        // Asegurarse de que los campos requeridos estén presentes
        if (!propertyData) {
          throw new Error("No se recibieron datos de la propiedad");
        }

        console.log("Property data before transform:", propertyData);

        // Transformar los datos si es necesario
        const transformedProperty = {
          ...propertyData,
          // Extraer nombres de comuna y región si vienen como objetos
          comuna: propertyData.comuna?.name || propertyData.comuna || "Comuna desconocida",
          region: propertyData.region?.name || propertyData.region || "Región desconocida",
          // Manejar imágenes - el backend ahora devuelve 'images' directamente
          // pero también mantener compatibilidad con propertyImages y propertyimage
          images:
            propertyData.images || // Primero intentar con 'images' (lo que devuelve el backend)
            propertyData.propertyImages?.map((img: any) => img.imageUrl) || // Fallback a propertyImages
            propertyData.propertyimage?.map((img: any) => img.imageUrl) || // Fallback a propertyimage (lowercase)
            [],
          // Manejar amenities - similar al caso de imágenes
          amenities:
            propertyData.amenities || // Primero intentar con 'amenities' (lo que devuelve el backend)
            propertyData.propertyAmenities?.map((pa: any) => pa.amenity) || // Fallback a propertyAmenities
            propertyData.propertyamenity?.map((pa: any) => pa.amenity) || // Fallback a propertyamenity (lowercase)
            [],
          landlord: propertyData.landlord || {
            id: propertyData.landlordId,
            landlordName: "Propietario",
          },
        };

        console.log("Transformed property:", transformedProperty);
        console.log("Images array:", transformedProperty.images);
        console.log("Address for geocoding:", {
          address: transformedProperty.address,
          comuna: transformedProperty.comuna,
          region: transformedProperty.region
        });
        setProperty(transformedProperty);
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProperty();
    }
  }, [params.id]);

  // Geocodificar la dirección cuando la propiedad se carga y el mapa está listo
  // Solo si NO hay coordenadas guardadas
  useEffect(() => {
    if (property && isMapLoaded && !property.latitude && !property.longitude) {
      geocodeAddress(property.address, property.comuna, property.region);
    } else if (property && property.latitude && property.longitude) {
      // Si ya tiene coordenadas, usar esas directamente
      setMapCenter({
        lat: Number(property.latitude),
        lng: Number(property.longitude),
      });
    }
  }, [property, isMapLoaded]);

  const handleSendMessage = () => {
    if (chatMessage.trim() && property) {
      const newMessage = {
        id: Date.now(),
        text: chatMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage("");

      // Simular respuesta automática del propietario
      setTimeout(() => {
        const autoReply = {
          id: Date.now() + 1,
          text: "¡Hola! Gracias por tu interés en la propiedad. ¿Te gustaría agendar una visita?",
          sender: "owner",
          timestamp: new Date().toLocaleTimeString(),
        };
        setChatMessages((prev) => [...prev, autoReply]);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen code-room-subtle-pattern flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-golden"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen code-room-subtle-pattern flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">
            Propiedad no encontrada
          </h1>
          <Link href="/search">
            <Button className="bg-golden hover:bg-education text-white">
              Volver a la búsqueda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen code-room-subtle-pattern">
      {/* Header */}
      <header className="bg-white border-b border-sage/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-golden to-education rounded-xl flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-800">URoom</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5 text-neutral-600" />
              </Button>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5 text-neutral-600" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/search">
          <Button variant="ghost" className="mb-6 text-sage hover:text-sage/80">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a la búsqueda
          </Button>
        </Link>

        {/* Property Details */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Images and Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={
                    property.images[selectedImageIndex] || "/placeholder.svg"
                  }
                  alt={property.title}
                  fill
                  className="object-cover"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {property.images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer ${
                      selectedImageIndex === index
                        ? "ring-2 ring-golden"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`Vista ${index + 1} de ${property.title}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Main Info */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-neutral-800">
                  {property.title}
                </h1>
                <Badge className="bg-sage text-white text-lg px-4 py-2">
                  ${parseInt(property.monthlyRent).toLocaleString()}/mes
                </Badge>
              </div>

              <div className="flex items-center text-neutral-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                {property.address}, {property.comuna}, {property.region}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-cream/20 rounded-lg">
                  <span className="block text-2xl font-semibold text-sage">
                    {property.bedrooms}
                  </span>
                  <span className="text-sm text-neutral-600">Habitaciones</span>
                </div>
                <div className="text-center p-3 bg-cream/20 rounded-lg">
                  <span className="block text-2xl font-semibold text-sage">
                    {property.bathrooms}
                  </span>
                  <span className="text-sm text-neutral-600">Baños</span>
                </div>
                <div className="text-center p-3 bg-cream/20 rounded-lg">
                  <span className="block text-2xl font-semibold text-sage">
                    {property.squareMeters}m²
                  </span>
                  <span className="text-sm text-neutral-600">Área</span>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-neutral-800 mb-2">
                  Descripción
                </h2>
                <p className="text-neutral-600 whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-neutral-800 mb-2">
                  Amenidades
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      className="flex items-center space-x-2 p-2 bg-cream/20 rounded-lg"
                    >
                      <span className="text-neutral-700">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                  Ubicación
                </h2>
                {mapLoadError && (
                  <div className="text-red-500 mb-4">
                    Error al cargar el mapa: {mapLoadError.message}
                  </div>
                )}
                {!isMapLoaded ? (
                  <div className="w-full h-[300px] bg-neutral-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden mx-auto mb-2"></div>
                      <p className="text-neutral-600">Cargando mapa...</p>
                    </div>
                  </div>
                ) : (
                  <GoogleMap
                    mapContainerStyle={{
                      width: "100%",
                      height: "300px",
                      borderRadius: "8px",
                    }}
                    center={mapCenter}
                    zoom={15}
                    options={{
                      zoomControl: true,
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: true,
                    }}
                  >
                    <Marker
                      position={mapCenter}
                      title={property.address}
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                        scaledSize: new window.google.maps.Size(40, 40),
                      }}
                    />
                  </GoogleMap>
                )}
                <div className="mt-2 flex items-center text-sm text-neutral-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <a
                    href={
                      property.latitude && property.longitude
                        ? `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            property.address + ", " + property.comuna + ", " + property.region + ", Chile"
                          )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-golden hover:underline"
                  >
                    Ver en Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact and Actions */}
          <div className="space-y-6">
            {/* Landlord Card */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-start space-x-4 mb-6">
                <Image
                  src="/placeholder-user.jpg"
                  alt={property.landlord.landlordName}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-semibold text-neutral-800">
                      {property.landlord.landlordName}
                    </h2>
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-neutral-600">Propietario verificado</p>
                  <p className="text-sm text-neutral-500">
                    Responde en ~2 horas
                  </p>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3">
                {(!user || !isLandlord(user)) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-golden hover:bg-education text-white font-semibold">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Contactar propietario
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <Image
                            src="/placeholder-user.jpg"
                            alt={property.landlord.landlordName}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div>
                            <div className="flex items-center space-x-1">
                              <span>{property.landlord.landlordName}</span>
                              <CheckCircle2 className="h-4 w-4 text-blue-500" />
                            </div>
                            <span className="text-sm text-neutral-500 font-normal">
                              Propietario verificado
                            </span>
                          </div>
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Property Info */}
                        <div className="bg-cream/20 p-3 rounded-lg">
                          <h4 className="font-medium text-neutral-800">
                            {property.title}
                          </h4>
                          <p className="text-sm text-neutral-600 mb-2">
                            {property.comuna} • $
                            {parseInt(property.monthlyRent).toLocaleString()}
                            /mes
                          </p>
                          <div className="flex items-center text-xs text-neutral-500 space-x-4">
                            <span>🛏️ {property.bedrooms} hab.</span>
                            <span>
                              🚿 {property.bathrooms} baño
                              {property.bathrooms > 1 ? "s" : ""}
                            </span>
                            <span>📐 {property.squareMeters}m²</span>
                          </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="h-64 overflow-y-auto space-y-2 border rounded-lg p-3 bg-neutral-50">
                          {chatMessages.length === 0 ? (
                            <div className="text-center text-neutral-500 text-sm py-8">
                              Inicia la conversación con{" "}
                              {property.landlord.landlordName}
                            </div>
                          ) : (
                            chatMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${
                                  message.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                                    message.sender === "user"
                                      ? "bg-sage text-white"
                                      : "bg-white border border-sage/20"
                                  }`}
                                >
                                  <p>{message.text}</p>
                                  <span className="text-xs opacity-70">
                                    {message.timestamp}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Message Input */}
                        <div className="flex space-x-2">
                          <Textarea
                            placeholder="Escribe tu mensaje..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            className="flex-1 min-h-[40px] max-h-[80px] border-sage/30 focus:border-sage focus:ring-sage/20"
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!chatMessage.trim()}
                            className="bg-golden hover:bg-education text-white"
                          >
                            Enviar
                          </Button>
                        </div>

                        <div className="text-xs text-neutral-500 text-center">
                          Responde en ~2 horas
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {/* Property Status */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Estado de la propiedad
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Disponibilidad</span>
                  <Badge
                    className={`${
                      property.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {property.isAvailable ? "Disponible" : "No disponible"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Tipo de propiedad</span>
                  <span className="text-neutral-800 font-medium">
                    {property?.propertyType
                      ? property.propertyType.toLowerCase() === "house"
                        ? "Casa"
                        : property.propertyType.toLowerCase() === "apartment"
                        ? "Departamento"
                        : property.propertyType.toLowerCase() === "room"
                        ? "Habitación"
                        : property.propertyType
                      : "No especificado"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Fecha de publicación</span>
                  <span className="text-neutral-800 font-medium">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
