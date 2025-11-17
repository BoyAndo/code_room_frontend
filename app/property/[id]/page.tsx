"use client";

import { useEffect, useState, useCallback } from "react";
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
  Send,
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

// ✅ IMPORTAR PUSHER CLIENT CORRECTAMENTE
import { pusherClient } from "@/lib/pusher.client";

// --- INTERFACES IDÉNTICAS A SEARCH/PAGE.TSX ---

// 1. INTERFAZ DE AUTENTICACIÓN
export interface StudentPayload {
  id: number;
  studentRut: string;
  studentEmail: string;
  studentName: string;
  studentCollege: string;
  role: "student";
}

export interface LandlordPayload {
  id: number;
  landlordRut: string;
  landlordEmail: string;
  landlordName: string;
  role: "landlord";
}

export type LoggedInUser = StudentPayload | LandlordPayload;

// 2. INTERFAZ DE MENSAJE API (Basada en tu DBMessage)
interface APIChatMessage {
  id: number;
  sender_id: number;
  recipient_id: number;
  property_id: number;
  content: string;
  created_at: string;
  sender_role: string; // ✅ CRÍTICO: "STUDENT" o "LANDLORD" (MAYÚSCULAS desde DB)
  recipient_role: string;
}

// 3. INTERFAZ DE MENSAJE PARA EL ESTADO LOCAL
interface ChatMessageState {
  id: number | string;
  text: string;
  sender: "user" | "other";
  timestamp: string;
  created_at: string;
}

// 4. INTERFAZ DE PROPIEDAD
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
  const { user: authUser } = useAuth();
  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useGoogleMaps();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // ✅ ESTADOS DE CHAT IDÉNTICOS A SEARCH/PAGE.TSX
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessageState[]>([]);

  // 🛑 NUEVO ESTADO: Usuario logueado (Para Pusher y lógica de chat)
  const [user, setUser] = useState<LoggedInUser | null>(null);

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: -33.447487,
    lng: -70.673676,
  });

  // Función para geocodificar la dirección
  const geocodeAddress = async (
    address: string,
    comuna: string,
    region: string
  ) => {
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

  // 🛑 INICIO: FUNCIÓN PARA CARGAR EL HISTORIAL DE CHAT (PERSISTENCIA) 🛑
  const fetchChatHistory = useCallback(
    async (propertyToLoad: Property) => {
      const isCurrentUserStudent = user?.role === "student";
      const studentId = user?.id;
      const landlordId = propertyToLoad.landlordId;

      if (!user || !propertyToLoad) {
        setChatMessages([]);
        return;
      }

      try {
        const url = `/api/chat/history?propertyId=${propertyToLoad.id}&landlordId=${landlordId}&studentId=${studentId}`;

        const historyResponse = await fetch(url, {
          method: "GET",
          credentials: "include",
        });

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          const formattedMessages: ChatMessageState[] = historyData.messages
            .map((msg: APIChatMessage) => ({
              id: msg.id,
              text: msg.content,
              sender:
                isCurrentUserStudent && msg.sender_role === "STUDENT"
                  ? "user"
                  : "other",
              timestamp: new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              created_at: msg.created_at,
            }))
            .sort(
              (a: any, b: any) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );

          setChatMessages(formattedMessages);
        } else {
          console.error(
            `Fallo al cargar el historial (Status: ${historyResponse.status})`
          );
          setChatMessages([]);
        }
      } catch (error) {
        console.error("Error de red al cargar el historial:", error);
        setChatMessages([]);
      }
    },
    [user]
  );
  // 🛑 FIN: FUNCIÓN PARA CARGAR EL HISTORIAL DE CHAT 🛑

  // ✅ FUNCIÓN DE ENVÍO DE MENSAJE IDÉNTICA A SEARCH/PAGE.TSX
  const handleSendMessage = async () => {
    if (chatMessage.trim() && property) {
      const messageContent = chatMessage.trim();
      setChatMessage("");

      try {
        const response = await fetch("/api/chat/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            recipientId: property.landlordId,
            propertyId: property.id,
            content: messageContent,
          }),
        });

        if (!response.ok) {
          console.error("Fallo al enviar el mensaje:", await response.json());
        }
      } catch (error) {
        console.error("Error de red al enviar el mensaje:", error);
      }
    }
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

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result);

        const propertyData = result.data || result;

        if (!propertyData) {
          throw new Error("No se recibieron datos de la propiedad");
        }

        console.log("Property data before transform:", propertyData);

        const transformedProperty = {
          ...propertyData,
<<<<<<< HEAD
          // Extraer nombres de comuna y región si vienen como objetos
          comuna: propertyData.comuna?.name || propertyData.comuna || "",
          region: propertyData.region?.name || propertyData.region || "",
          // Manejar imágenes - el backend ahora devuelve 'images' directamente
          // pero también mantener compatibilidad con propertyImages y propertyimage
=======
          comuna:
            propertyData.comuna?.name ||
            propertyData.comuna ||
            "Comuna desconocida",
          region:
            propertyData.region?.name ||
            propertyData.region ||
            "Región desconocida",
>>>>>>> 44fd861c29a44f8f9af2eafe3fdcf778c7bb3db1
          images:
            propertyData.images ||
            propertyData.propertyImages?.map((img: any) => img.imageUrl) ||
            propertyData.propertyimage?.map((img: any) => img.imageUrl) ||
            [],
          amenities:
            propertyData.amenities ||
            propertyData.propertyAmenities?.map((pa: any) => pa.amenity) ||
            propertyData.propertyamenity?.map((pa: any) => pa.amenity) ||
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
          region: transformedProperty.region,
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
  useEffect(() => {
    if (property && isMapLoaded && !property.latitude && !property.longitude) {
      geocodeAddress(property.address, property.comuna, property.region);
    } else if (property && property.latitude && property.longitude) {
      setMapCenter({
        lat: Number(property.latitude),
        lng: Number(property.longitude),
      });
    }
  }, [property, isMapLoaded]);

  // 🛑 EFECTO PARA CARGAR DATOS DEL USUARIO LOGUEADO 🛑
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiFetch("http://localhost:3001/auth/me", {
          method: "GET",
        });

        if (response.ok) {
          const responseData = await response.json();
          const userData = responseData.user || responseData;

          if (userData && userData.id) {
            console.log("DEBUG AUTH: ✅ Usuario cargado con ID:", userData.id);
            setUser(userData as LoggedInUser);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "DEBUG AUTH: 🛑 Error de red al cargar el usuario:",
          error
        );
        setUser(null);
      }
    };

    loadUser();
  }, []);

  // 🛑 EFECTO PARA LA SUSCRIPCIÓN EN TIEMPO REAL CON PUSHER 🛑
  useEffect(() => {
    if (!property || !user || !pusherClient) {
      console.log("⚠️ Pusher - Condiciones no cumplidas:", {
        property: !!property,
        user: !!user,
        pusherClient: !!pusherClient,
      });
      return;
    }

    const isCurrentUserStudent = user.role === "student";
    const senderId = user.id;
    const recipientId = property.landlordId;
    const propertyId = property.id;

    const sortedIds = [Number(senderId), Number(recipientId)]
      .sort((a, b) => a - b)
      .join("-");
    const chatRoomId = `private-chat-prop-${propertyId}-${sortedIds}`;

    console.log("🔔 Pusher - Suscribiéndose al canal:", chatRoomId);
    console.log("🔔 Pusher - Usuario actual:", {
      id: senderId,
      role: user.role,
      isStudent: isCurrentUserStudent,
    });

    const channel = pusherClient.subscribe(chatRoomId);

    const handleNewMessage = (data: APIChatMessage) => {
      console.log("📨 Pusher - Nuevo mensaje recibido:", data);
      console.log("📨 Pusher - Rol del remitente:", data.sender_role);
      console.log(
        "📨 Pusher - Usuario actual es estudiante:",
        isCurrentUserStudent
      );

      const newMessage: ChatMessageState = {
        id: data.id,
        text: data.content,
        sender:
          isCurrentUserStudent && data.sender_role === "STUDENT"
            ? "user"
            : !isCurrentUserStudent && data.sender_role === "LANDLORD"
            ? "user"
            : "other",
        timestamp: new Date(data.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        created_at: data.created_at,
      };

      console.log("📨 Pusher - Mensaje procesado:", newMessage);
      setChatMessages((prev) => {
        if (prev.some((msg) => msg.id === newMessage.id)) {
          console.log("⚠️ Pusher - Mensaje duplicado, ignorando");
          return prev;
        }
        console.log("✅ Pusher - Agregando mensaje al estado");
        return [...prev, newMessage];
      });
    };

    channel.bind("message-sent", handleNewMessage);

    console.log("✅ Pusher - Suscripción completada al canal:", chatRoomId);

    return () => {
      console.log("🔌 Pusher - Desuscribiéndose del canal:", chatRoomId);
      channel.unbind("message-sent", handleNewMessage);
      pusherClient.unsubscribe(chatRoomId);
    };
  }, [property, user]);

  // 🛑 EFECTO PARA CARGAR EL HISTORIAL DE CHAT CUANDO HAY PROPIEDAD Y USUARIO 🛑
  useEffect(() => {
    if (!property || !user) {
      return;
    }
    fetchChatHistory(property);
  }, [property, user, fetchChatHistory]);

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
                {[
                  property.address,
                  property.comuna,
                  property.region
                ].filter(Boolean).join(", ")}
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
                      streetViewControl: true, // ✅ STREET VIEW ACTIVADO
                      streetViewControlOptions: {
                        position:
                          window.google.maps.ControlPosition.RIGHT_BOTTOM,
                      },
                      mapTypeControl: false,
                      fullscreenControl: true,
                      fullscreenControlOptions: {
                        position: window.google.maps.ControlPosition.RIGHT_TOP,
                      },
                      gestureHandling: "greedy",
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
                            property.address +
                              ", " +
                              property.comuna +
                              ", " +
                              property.region +
                              ", Chile"
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
                {(!authUser || !isLandlord(authUser)) && (
                  <Dialog>
                    <DialogTrigger asChild disabled={!user}>
                      <Button
                        className="w-full bg-golden hover:bg-education text-white font-semibold"
                        onClick={() => {
                          // Cargar el historial de chat cuando se abre el diálogo
                          if (user && property) {
                            fetchChatHistory(property);
                          }
                        }}
                      >
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
                            <Send className="h-4 w-4" />
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
