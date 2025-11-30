"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// En page.tsx (Alrededor de la línea 24)

import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  MapPin,
  Filter,
  Heart,
  Star,
  Home,
  User,
  Bell,
  MessageCircle,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ✅ IMPORTAR PUSHER CLIENT CORRECTAMENTE
import { pusherClient } from "@/lib/pusher.client";

// --- INTERFACES CRÍTICAS ---

// 1. INTERFAZ DE AUTENTICACIÓN
export interface StudentPayload {
  id: number;
  studentRut: string;
  studentEmail: string;
  studentName: string;
  studentCollege: string;
  role: "student"; // Rol en MINÚSCULAS desde /auth/me
}

export interface LandlordPayload {
  id: number;
  landlordRut: string;
  landlordEmail: string;
  landlordName: string;
  role: "landlord"; // Rol en MINÚSCULAS desde /auth/me
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
  sender: "user" | "other"; // Propiedad computada para el renderizado
  timestamp: string; // Hora formateada
  created_at: string; // Timestamp de la DB
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

interface PropertyAmenity {
  id: number;
  propertyId: number;
  amenityId: number;
  createdAt: string;
  amenity: Amenity;
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
  comuna: string | { id: number; name: string }; // Puede ser string o objeto
  region: string | { id: number; name: string }; // Puede ser string o objeto
  comunaName?: string; // Nombre de la comuna como string
  regionName?: string; // Nombre de la región como string
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
  latitude: number;
  longitude: number;
  propertyImages: PropertyImage[];
  propertyAmenities: PropertyAmenity[];
  images: string[];
  amenities: Amenity[];
  landlord: Landlord;
}
// --- FIN INTERFACES ---

// ⬅️ LISTA GRANDE DE CIUDADES (Añade todas las que necesites)
const STATIC_CITIES = [
  // Ciudades originales
  "Santiago",
  "Valparaíso",
  "Concepción",
  "Temuco",
  "Viña del Mar",
  "Antofagasta",
  "La Serena",
  "Rancagua",
  "Talca",
  "Puerto Montt",
  "Iquique",
  "Chillán",
  "Punta Arenas",
  // Comunas agregadas de la BD
  "Arica",
  "Camarones",
  "Putre",
  "General Lagos",
  "Alto Hospicio",
  "Pozo Almonte",
  "Camiña",
  "Colchane",
  "Huara",
  "Pica",
  "Mejillones",
  "Sierra Gorda",
  "Taltal",
  "Calama",
  "Ollagüe",
  "San Pedro de Atacama",
  "Tocopilla",
  "María Elena",
  "Copiapó",
  "Caldera",
  "Tierra Amarilla",
  "Chañaral",
  "Diego de Almagro",
  "Vallenar",
  "Alto del Carmen",
  "Freirina",
  "Huasco",
  "Coquimbo",
  "Andacollo",
  "La Higuera",
  "Paiguano",
  "Vicuña",
  "Illapel",
  "Canela",
  "Los Vilos",
  "Salamanca",
  "Ovalle",
  "Combarbalá",
  "Monte Patria",
  "Punitaqui",
  "Río Hurtado",
  "Casablanca",
  "Concón",
  "Juan Fernández",
  "Puchuncaví",
  "Quintero",
  "Isla de Pascua",
  "Los Andes",
  "Calle Larga",
  "Rinconada",
  "San Esteban",
  "La Ligua",
  "Cabildo",
  "Papudo",
  "Petorca",
  "Zapallar",
  "Quillota",
  "Calera",
  "Hijuelas",
  "La Cruz",
  "Nogales",
  "San Antonio",
  "Algarrobo",
  "Cartagena",
  "El Quisco",
  "El Tabo",
  "Santo Domingo",
  "San Felipe",
  "Catemu",
  "Llaillay",
  "Panquehue",
  "Putaendo",
  "Santa María",
  "Quilpué",
  "Limache",
  "Olmué",
  "Villa Alemana",
  "Cerrillos",
  "Cerro Navia",
  "Conchalí",
  "El Bosque",
  "Estación Central",
  "Huechuraba",
  "Independencia",
  "La Cisterna",
  "La Florida",
  "La Granja",
  "La Pintana",
  "La Reina",
  "Las Condes",
  "Lo Barnechea",
  "Lo Espejo",
  "Lo Prado",
  "Macul",
  "Maipú",
  "Ñuñoa",
  "Pedro Aguirre Cerda",
  "Peñalolén",
  "Providencia",
  "Pudahuel",
  "Quilicura",
  "Quinta Normal",
  "Recoleta",
  "Renca",
  "San Joaquín",
  "San Miguel",
  "San Ramón",
  "Vitacura",
  "Puente Alto",
  "Pirque",
  "San José de Maipo",
  "Colina",
  "Lampa",
  "Tiltil",
  "San Bernardo",
  "Buin",
  "Calera de Tango",
  "Paine",
  "Melipilla",
  "Alhué",
  "Curacaví",
  "María Pinto",
  "San Pedro",
  "Talagante",
  "El Monte",
  "Isla de Maipo",
  "Padre Hurtado",
  "Peñaflor",
  "Codegua",
  "Coinco",
  "Coltauco",
  "Doñihue",
  "Graneros",
  "Las Cabras",
  "Machalí",
  "Malloa",
  "Mostazal",
  "Olivar",
  "Peumo",
  "Pichidegua",
  "Quinta de Tilcoco",
  "Rengo",
  "Requínoa",
  "San Vicente",
  "Pichilemu",
  "La Estrella",
  "Litueche",
  "Marchihue",
  "Navidad",
  "Paredones",
  "San Fernando",
  "Chépica",
  "Chimbarongo",
  "Lolol",
  "Nancagua",
  "Palmilla",
  "Peralillo",
  "Placilla",
  "Pumanque",
  "Santa Cruz",
  "Constitución",
  "Curepto",
  "Empedrado",
  "Maule",
  "Pelarco",
  "Pencahue",
  "Río Claro",
  "San Clemente",
  "San Rafael",
  "Cauquenes",
  "Chanco",
  "Pelluhue",
  "Curicó",
  "Hualañé",
  "Licantén",
  "Molina",
  "Rauco",
  "Romeral",
  "Sagrada Familia",
  "Teno",
  "Vichuquén",
  "Linares",
  "Colbún",
  "Longaví",
  "Parral",
  "Retiro",
  "San Javier",
  "Villa Alegre",
  "Yerbas Buenas",
  "Coronel",
  "Chiguayante",
  "Florida",
  "Hualqui",
  "Lota",
  "Penco",
  "San Pedro de la Paz",
  "Santa Juana",
  "Talcahuano",
  "Tomé",
  "Hualpén",
  "Lebu",
  "Arauco",
  "Cañete",
  "Contulmo",
  "Curanilahue",
  "Los Álamos",
  "Tirúa",
  "Los Ángeles",
  "Antuco",
  "Cabrero",
  "Laja",
  "Mulchén",
  "Nacimiento",
  "Negrete",
  "Quilaco",
  "Quilleco",
  "San Rosendo",
  "Santa Bárbara",
  "Tucapel",
  "Yumbel",
  "Alto Biobío",
  "Bulnes",
  "Cobquecura",
  "Coelemu",
  "Coihueco",
  "Chillán Viejo",
  "El Carmen",
  "Ninhue",
  "Ñiquén",
  "Pemuco",
  "Pinto",
  "Portezuelo",
  "Quillón",
  "Quirihue",
  "Ránquil",
  "San Carlos",
  "San Fabián",
  "San Ignacio",
  "San Nicolás",
  "Treguaco",
  "Yungay",
  "Carahue",
  "Cunco",
  "Curarrehue",
  "Freire",
  "Galvarino",
  "Gorbea",
  "Lautaro",
  "Loncoche",
  "Melipeuco",
  "Nueva Imperial",
  "Padre Las Casas",
  "Perquenco",
  "Pitrufquén",
  "Pucón",
  "Saavedra",
  "Teodoro Schmidt",
  "Toltén",
  "Vilcún",
  "Villarrica",
  "Cholchol",
  "Angol",
  "Collipulli",
  "Curacautín",
  "Ercilla",
  "Lonquimay",
  "Los Sauces",
  "Lumaco",
  "Purén",
  "Renaico",
  "Traiguén",
  "Victoria",
  "Valdivia",
  "Corral",
  "Lanco",
  "Los Lagos",
  "Máfil",
  "Mariquina",
  "Paillaco",
  "Panguipulli",
  "La Unión",
  "Futrono",
  "Lago Ranco",
  "Río Bueno",
  "Calbuco",
  "Cochamó",
  "Fresia",
  "Frutillar",
  "Los Muermos",
  "Llanquihue",
  "Maullín",
  "Puerto Varas",
  "Castro",
  "Ancud",
  "Chonchi",
  "Curaco de Vélez",
  "Dalcahue",
  "Puqueldón",
  "Queilén",
  "Quellón",
  "Quemchi",
  "Quinchao",
  "Osorno",
  "Puerto Octay",
  "Purranque",
  "Puyehue",
  "Río Negro",
  "San Juan de la Costa",
  "San Pablo",
  "Chaitén",
  "Futaleufú",
  "Hualaihué",
  "Palena",
  "Coyhaique",
  "Lago Verde",
  "Aysén",
  "Cisnes",
  "Guaitecas",
  "Cochrane",
  "O'Higgins",
  "Tortel",
  "Chile Chico",
  "Río Ibáñez",
  "Laguna Blanca",
  "Río Verde",
  "San Gregorio",
  "Cabo de Hornos",
  "Antártica",
  "Porvenir",
  "Primavera",
  "Timaukel",
  "Natales",
  "Torres del Paine",
];

export default function SearchPage() {
  // ⬅️ INICIO DE TODOS LOS ESTADOS
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("recent");
  const [searchTrigger, setSearchTrigger] = useState(0);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [chatMessage, setChatMessage] = useState("");
  // ✅ ESTADO CON EL TIPO DE INTERFAZ CORRECTO
  const [chatMessages, setChatMessages] = useState<ChatMessageState[]>([]);
  const [filtersActive, setFiltersActive] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  // 🛑 NUEVO ESTADO: Usuario logueado (Para Pusher y lógica de chat)
  const [user, setUser] = useState<LoggedInUser | null>(null);

  // ✅ HELPER: Obtener nombre de comuna
  const getComunaName = (property: Property): string => {
    if (typeof property.comuna === "string") {
      return property.comuna;
    } else if (property.comuna && typeof property.comuna === "object") {
      return property.comuna.name;
    } else if (property.comunaName) {
      return property.comunaName;
    }
    return "";
  };

  const clearFilters = () => {
    setSelectedCity("");
    setPropertyType("");
    setPriceRange("");
    setSortOrder("recent");
  };

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);

      console.log("🔍 =========================");
      console.log("🔍 FETCH PROPERTIES CALLED");
      console.log(
        "🔍 Filters - City:",
        selectedCity,
        "Type:",
        propertyType,
        "Price:",
        priceRange,
        "Sort:",
        sortOrder
      );

      const params = new URLSearchParams();

      if (selectedCity) {
        params.append("comuna", selectedCity);
      }
      if (propertyType) {
        params.append("propertyType", propertyType);
      }
      if (priceRange) {
        const [min, max] = priceRange.split("-");
        params.append("minRent", min);
        params.append("maxRent", max);
      }

      if (sortOrder && sortOrder !== "recent") {
        let [sortBy, order] = sortOrder.split("-");

        if (sortOrder === "monthlyRent-desc-asc") {
          params.append("sortBy", "monthlyRent");
          params.append("order", "asc");
        } else {
          params.append("sortBy", sortBy);
          params.append("order", order);
        }
      }

      const queryString = params.toString();
      const API_PROPERTIES_URL = process.env.NEXT_PUBLIC_API_PROPERTIES_URL || 'http://localhost:3002/api';
      const url = `${API_PROPERTIES_URL}/properties/with-landlord${
        queryString ? `?${queryString}` : ""
      }`;

      // Usar apiFetch que maneja automáticamente el refresh de tokens
      const response = await apiFetch(url);

      console.log("🔍 Response status:", response.status);
      console.log("🔍 Response ok:", response.ok);

      if (!response.ok) {
        console.error(
          "❌ Response not OK:",
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error("❌ Error body:", errorText);
        setProperties([]);
        return;
      }

      const result = await response.json();
      console.log("🔍 Full API Response:", result);
      console.log("🔍 Type of result:", typeof result);
      console.log("🔍 Is result an array?", Array.isArray(result));
      console.log("🔍 result.data:", result.data);
      console.log("🔍 result.properties:", result.properties);

      const data = result.data?.properties || result.properties || result;
      console.log("🔍 Extracted properties (before transform):", data);
      console.log("🔍 Data length:", data?.length);

      // ✅ DEBUG: Ver la primera propiedad con detalle
      if (data && data.length > 0) {
        console.log("🔍 Primera propiedad completa:", data[0]);
        console.log("🔍 Comuna de la primera propiedad:", data[0].comuna);
        console.log(
          "🔍 ComunaName de la primera propiedad:",
          data[0].comunaName
        );
        console.log("🔍 Region de la primera propiedad:", data[0].region);
        console.log(
          "🔍 RegionName de la primera propiedad:",
          data[0].regionName
        );
      }

      if (Array.isArray(data)) {
        // Transformar las propiedades para asegurar que tengan el array de images
        const transformedProperties = data.map((property: any) => ({
          ...property,
          // Manejar imágenes - el backend puede devolver 'images', 'propertyImages' o 'propertyimage'
          images:
            property.images || // Backend devuelve directamente 'images'
            property.propertyImages?.map((img: any) => img.imageUrl) || // Fallback a propertyImages
            property.propertyimage?.map((img: any) => img.imageUrl) || // Fallback a propertyimage (lowercase)
            [],
        }));
        console.log("🔍 Transformed properties:", transformedProperties);
        console.log(
          "🔍 Setting properties to state with length:",
          transformedProperties.length
        );
        setProperties(transformedProperties as Property[]);
        console.log("✅ Properties set successfully!");
      } else {
        console.error("❌ Data is not an array, setting empty array");
        setProperties([]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [sortOrder, searchTrigger]);

  // 🛑 INICIO: FUNCIÓN PARA CARGAR EL HISTORIAL DE CHAT (PERSISTENCIA) 🛑
  const fetchChatHistory = useCallback(
    async (propertyToLoad: Property) => {
      // Usamos el rol del usuario logueado para la comparación.
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
          // ✅ USAMOS LA INTERFAZ Y APLICAMOS LA LÓGICA DE ROL
          const formattedMessages: ChatMessageState[] = historyData.messages
            .map((msg: APIChatMessage) => ({
              id: msg.id,
              text: msg.content,
              // 🔑 CORRECCIÓN CRÍTICA: Lógica basada en el rol del remitente del mensaje
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

  const handleSendMessage = async () => {
    if (chatMessage.trim() && selectedProperty) {
      const messageContent = chatMessage.trim();
      setChatMessage("");

      // 2. Llamada a la API de envío
      try {
        const response = await fetch("/api/chat/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            recipientId: selectedProperty.landlordId,
            propertyId: selectedProperty.id,
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
    const filtersActive = !!selectedCity || !!propertyType || !!priceRange;
    setFiltersActive(filtersActive);
  }, [selectedCity, propertyType, priceRange]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // 🛑 INICIO: EFECTO PARA CARGAR DATOS DEL USUARIO LOGUEADO 🛑
  useEffect(() => {
    const loadUser = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await apiFetch(`${API_BASE_URL}/auth/me`, {
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

  // 🛑 INICIO: EFECTO PARA LA SUSCRIPCIÓN EN TIEMPO REAL CON PUSHER 🛑
  useEffect(() => {
    if (!selectedProperty || !user || !pusherClient) {
      console.log("⚠️ Pusher - Condiciones no cumplidas:", {
        selectedProperty: !!selectedProperty,
        user: !!user,
        pusherClient: !!pusherClient,
      });
      return;
    }

    // Usamos el rol del usuario loggeado para la comparación en el handler
    const isCurrentUserStudent = user.role === "student";
    const senderId = user.id;
    const recipientId = selectedProperty.landlordId;
    const propertyId = selectedProperty.id;

    // ✅ CORRECCIÓN: Generar el chatRoomId igual que en el backend (IDs ordenados)
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

    // ✅ USAMOS LA INTERFAZ Y APLICAMOS LA LÓGICA DE ROL
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
        // 🔑 CORRECCIÓN CRÍTICA: Lógica basada en el rol del remitente del mensaje
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
        // Evitar duplicados
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
  }, [selectedProperty, user]);
  // 🛑 FIN: EFECTO PARA LA SUSCRIPCIÓN EN TIEMPO REAL CON PUSHER 🛑

  // 🛑 EFECTO PARA CARGAR EL HISTORIAL DE CHAT 🛑
  useEffect(() => {
    if (!selectedProperty || !user) {
      return;
    }
    fetchChatHistory(selectedProperty);
  }, [selectedProperty, user, fetchChatHistory]);
  // 🛑 FIN NUEVO useEffect 🛑

  // Debug: Log properties state
  console.log("🎨 RENDER - Properties length:", properties?.length);
  console.log("🎨 RENDER - Loading:", loading);
  console.log("🎨 RENDER - Properties:", properties);

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
        {/* Search Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-6">
            Buscar Propiedades
          </h1>

          <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* 1. FILTRO DE CIUDAD (COMBOBOX CON BÚSQUEDA) */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-2">
                    Filtrar por ciudad
                  </label>
                  <Popover open={isCityOpen} onOpenChange={setIsCityOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isCityOpen}
                        className="w-full justify-between border-sage/30 focus:border-sage focus:ring-sage/20"
                      >
                        {selectedCity
                          ? STATIC_CITIES.find(
                              (city) => city.toLowerCase() === selectedCity
                            )
                          : "Selecciona ciudad..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar ciudad..." />
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron ciudades.
                          </CommandEmpty>
                          <CommandGroup>
                            {STATIC_CITIES.map((city) => (
                              <CommandItem
                                key={city}
                                value={city}
                                onSelect={(currentValue) => {
                                  setSelectedCity(
                                    currentValue === selectedCity
                                      ? ""
                                      : currentValue.toLowerCase()
                                  );
                                  setIsCityOpen(false);
                                }}
                              >
                                {city}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* 2. FILTRO DE TIPO DE PROPIEDAD */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-2">
                    Filtrar por tipo (casa, pieza o depto)
                  </label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="border-sage/30 focus:border-sage focus:ring-sage/20">
                      <SelectValue placeholder="Tipo de propiedad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room">Habitación</SelectItem>
                      <SelectItem value="apartment">Departamento</SelectItem>
                      <SelectItem value="house">Casa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. FILTRO DE RANGO DE PRECIO */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-2">
                    Filtrar por rango de precio
                  </label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="border-sage/30 focus:border-sage focus:ring-sage/20">
                      <SelectValue placeholder="Rango de precio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-300000">$0 - $300.000</SelectItem>
                      <SelectItem value="300000-500000">
                        $300.000 - $500.000
                      </SelectItem>
                      <SelectItem value="500000-700000">
                        $500.000 - $700.000
                      </SelectItem>
                      <SelectItem value="700000-2000000">$700.000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 border-t pt-4 border-sage/10">
                <Button
                  onClick={() => setSearchTrigger((prev) => prev + 1)}
                  variant="destructive"
                  className="bg-golden hover:bg-education text-white flex-1 font-semibold"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Aplicar Filtros
                </Button>

                {filtersActive && (
                  <Button
                    onClick={() => {
                      clearFilters();
                      setSearchTrigger((prev) => prev + 1);
                    }}
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Eliminar Filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-800">
            {properties?.length || 0} propiedades encontradas
          </h2>

          <Select
            onValueChange={(value) => {
              setSortOrder(value);
            }}
            value={sortOrder}
          >
            <SelectTrigger className="w-48 border-sage/30">
              <SelectValue asChild>
                <span className="truncate">
                  {sortOrder === "recent"
                    ? "Más Recientes"
                    : sortOrder === "monthlyRent-desc-asc"
                    ? "Precio: Menor a Mayor"
                    : sortOrder === "monthlyRent-desc"
                    ? "Precio: Mayor a Menor"
                    : "Ordenar por"}
                </span>
              </SelectValue>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="recent">Más Recientes</SelectItem>

              <SelectItem value="monthlyRent-desc-asc">
                Precio: Menor a Mayor
              </SelectItem>

              <SelectItem value="monthlyRent-desc">
                Precio: Mayor a Menor
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Properties Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Card
                key={n}
                className="bg-white/90 backdrop-blur-sm border-sage/20"
              >
                <div className="animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : properties?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-neutral-600">
              Intenta ajustar tus filtros de búsqueda para encontrar más
              opciones.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties?.map((property) => (
              <Card
                key={property.id}
                className="bg-white/90 backdrop-blur-sm border-sage/20 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="relative">
                  <Image
                    src={property.images?.[0] || "/placeholder.svg"}
                    alt={property.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Badge className="absolute bottom-3 left-3 bg-sage text-white">
                    ${parseInt(property.monthlyRent).toLocaleString()}/mes
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-neutral-800 text-lg">
                      {property.title}
                    </h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-neutral-600">4.5</span>
                    </div>
                  </div>

                  <p className="text-neutral-600 text-sm mb-3">
                    {property.description}
                  </p>

                  <div className="flex items-center text-sm text-neutral-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />

                    <Link
                      // El enlace a Google Maps sigue utilizando las coordenadas para la precisión.
                      href={`http://maps.google.com/maps?q=${property.latitude},${property.longitude}`}
                      target="_blank" // Abrir en una nueva pestaña
                      rel="noopener noreferrer"
                      // Estilos para que el texto de la dirección se vea como un enlace
                      className="hover:underline hover:text-education transition duration-150"
                    >
                      {/* 🛑 AHORA MUESTRA LA DIRECCIÓN COMPLETA REGISTRADA 🛑 */}
                      <span className="truncate max-w-[200px] sm:max-w-none block">
                        {property.address}
                      </span>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between text-sm text-neutral-600 mb-3">
                    <div className="flex items-center space-x-4">
                      <span>🛏️ {property.bedrooms} hab.</span>
                      <span>
                        🚿 {property.bathrooms} baño
                        {property.bathrooms > 1 ? "s" : ""}
                      </span>
                      <span>📐 {property.squareMeters}m²</span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {property.propertyType.toLowerCase() === "house"
                        ? "Casa"
                        : property.propertyType.toLowerCase() === "apartment"
                        ? "Departamento"
                        : property.propertyType.toLowerCase() === "room"
                        ? "Habitación"
                        : property.propertyType}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.amenities.slice(0, 4).map((amenity, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-sage/10 text-sage flex items-center gap-1"
                      >
                        {amenity.name}
                      </Badge>
                    ))}
                    {property.amenities.length > 4 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-sage/10 text-sage"
                      >
                        +{property.amenities.length - 4} más
                      </Badge>
                    )}
                  </div>

                  <Link href={`/property/${property.id}`}>
                    <Button className="w-full bg-golden hover:bg-education text-white mb-3 font-semibold">
                      Ver más detalles
                    </Button>
                  </Link>

                  {/* Author Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-sage/10">
                    <div className="flex items-center space-x-2">
                      <Image
                        src="/placeholder-user.jpg"
                        alt={property.landlord.landlordName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium text-neutral-800">
                            {property.landlord.landlordName}
                          </span>
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild disabled={!user}>
                        <Button
                          size="sm"
                          className="bg-golden hover:bg-education text-white font-semibold"
                          onClick={() => {
                            // 1. Establecer la propiedad seleccionada.
                            setSelectedProperty(property);

                            // 2. 🔑 CORRECCIÓN CRÍTICA: Llamar a fetchChatHistory inmediatamente
                            //    para cargar la data al mismo tiempo que se abre el Dialog.
                            //    Usamos 'property' directamente ya que 'selectedProperty' aún no se ha actualizado.
                            if (user) {
                              fetchChatHistory(property);
                            }
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat
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
                              {getComunaName(property)} • $
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
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
