"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/command"; // ⬅️ NUEVOS IMPORTS
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // ⬅️ NUEVOS IMPORTS
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

// 🛑 INICIO: SETUP DE PUSHER CLIENT 🛑
// DEBES instalar: npm install pusher-js
// Luego, asegúrate de que 'pusherClient' se inicialice y esté disponible.
// Una forma común es hacerlo globalmente o importarlo desde un archivo de configuración.

// IMPORT PUSHER-JS (Añade esta línea si no la tienes)
// import PusherClient from 'pusher-js';

// INICIALIZACIÓN GLOBAL (Si no tienes un archivo dedicado para esto, puedes hacerlo aquí)
// const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
//   cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
//   authEndpoint: '/api/pusher/auth', // Si usas canales privados
// });

// Para que el código compile, asumiré una variable global para PusherClient
declare const pusherClient: any;
// 🛑 FIN: SETUP DE PUSHER CLIENT 🛑

// Definir tipos para las propiedades
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

// 🛑 INICIO: INTERFACES DE AUTENTICACIÓN PARA EL ESTADO 'user' 🛑
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
// 🛑 FIN: INTERFACES DE AUTENTICACIÓN 🛑

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
  latitude: number;
  longitude: number;
  propertyImages: PropertyImage[];
  propertyAmenities: PropertyAmenity[];
  images: string[];
  amenities: Amenity[];
  landlord: Landlord;
}

// Función para obtener iconos de amenidades
const getAmenityIcon = (iconName: string) => {
  const iconMap: { [key: string]: string } = {
    wifi: "📶",
    flame: "🔥",
    car: "🚗",
    "chef-hat": "👨‍🍳",
    tv: "📺",
    washing: "🧺",
    pool: "🏊‍♂️",
    gym: "🏋️‍♂️",
    pet: "🐕",
    elevator: "🛗",
    security: "🔒",
    garden: "🌳",
    balcony: "🏡",
    default: "✅",
  };
  return iconMap[iconName] || iconMap.default;
};

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
  const [sortOrder, setSortOrder] = useState<string>("recent"); // Inicializa con 'recent' para evitar el error
  const [searchTrigger, setSearchTrigger] = useState(0);
  // ...
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  // const [chatMessage, setChatMessage] = useState("");
  // const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  // const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [filtersActive, setFiltersActive] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  // 🛑 NUEVO ESTADO: Usuario logueado (Para Pusher y lógica de chat)
  const [user, setUser] = useState<LoggedInUser | null>(null);

  // En page.tsx (Junto a tus otras funciones)
  const clearFilters = () => {
    // 1. Reiniciar los estados a su valor inicial (vacío)
    setSelectedCity("");
    setPropertyType("");
    setPriceRange("");
    setSortOrder("recent"); // Incluir el ordenamiento
  };

  // Función para obtener propiedades (¡CORREGIDA y UNIFICADA!)
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 1. CONSTRUIR LOS FILTROS DE CONSULTA (query parameters)
      const params = new URLSearchParams();

      if (selectedCity) {
        params.append("comuna", selectedCity);
      }
      if (propertyType) {
        params.append("propertyType", propertyType);
      }
      // En page.tsx (dentro de fetchProperties)
      if (priceRange) {
        const [min, max] = priceRange.split("-"); // min='300000', max='500000'
        params.append("minRent", min);
        params.append("maxRent", max);
      }

      if (sortOrder && sortOrder !== "recent") {
        let [sortBy, order] = sortOrder.split("-");

        // LÓGICA DE COMPENSACIÓN
        if (sortOrder === "monthlyRent-desc-asc") {
          params.append("sortBy", "monthlyRent");
          params.append("order", "asc"); // Envía 'asc'
        } else {
          // Para 'Más Recientes' y 'Mayor a Menor'
          params.append("sortBy", sortBy);
          params.append("order", order);
        }
      }

      const queryString = params.toString();
      const url = `http://localhost:3002/api/properties/with-landlord${
        queryString ? `?${queryString}` : ""
      }`;

      console.log("Fetching properties from URL:", url);

      // 2. CONSTRUIR LOS HEADERS DE FORMA DINÁMICA
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`; // ⬅️ SOLO SE AÑADE SI HAY TOKEN
      }

      const response = await fetch(url, {
        method: "GET",
        headers: headers, // ⬅️ USAMOS LOS HEADERS DINÁMICOS
        credentials: "include",
      });

      // 3. CONTINUAR CON EL MANEJO DE LA RESPUESTA

      if (!response.ok) {
        console.error(
          `Error al obtener propiedades: HTTP status ${response.status}`
        );
        // 🔑 CORRECCIÓN: Eliminamos el 'throw' para evitar que la app se rompa
        setProperties([]); // Aseguramos que la lista se vacíe en caso de error
        return; // Salimos de la función sin intentar parsear el JSON
      }

      const result = await response.json();
      // ...
      const data = result.data?.properties || result.properties || result;

      // Actualizar estado de filtros activos
      // setFiltersActive(!!queryString);

      if (Array.isArray(data)) {
        setProperties(data);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      // Solo lanzamos un error si no es un 401, ya que para la búsqueda es esperado si no hay login
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [sortOrder, searchTrigger]); // ⬅️ ¡LISTA DE DEPENDENCIAS VITAL!
  // ⬅️ FIN DE LA FUNCIÓN fetchProperties

  // 🛑 INICIO: FUNCIÓN PARA CARGAR EL HISTORIAL DE CHAT (PERSISTENCIA) 🛑
  const fetchChatHistory = useCallback(
    async (propertyToLoad: Property) => {
      // 1. Identificar al estudiante (user) y al propietario (recipient)
      const studentId = user?.id; // El usuario logueado es el estudiante
      const landlordId = propertyToLoad.landlordId; // El propietario es el destinatario

      if (!studentId || !propertyToLoad) {
        // DEBUG: Si ves este error, el usuario no ha cargado (problema asíncrono).
        console.error(
          "DEBUG: Carga de historial detenida. El usuario (estudiante) no está cargado o la propiedad es nula."
        );
        setChatMessages([]);
        return;
      }

      try {
        // 2. CONSTRUCCIÓN DE LA URL CORREGIDA y EXPLÍCITA:
        // Envía el studentId y el landlordId para que el backend busque la conversación completa.
        const url = `/api/chat/history?propertyId=${propertyToLoad.id}&landlordId=${landlordId}&studentId=${studentId}`;

        // DEBUG: Si ves este log, la función se ejecutó y la petición debería aparecer en Network.
        console.log("DEBUG: Se inicia la petición de historial con URL:", url);

        const historyResponse = await fetch(url, {
          method: "GET",
          credentials: "include", // Incluye la cookie de autenticación
        });

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          const formattedMessages: any[] = historyData.messages
            .map((msg: any) => ({
              id: msg.id,
              text: msg.content,
              // Determina si el mensaje es del usuario logueado (el estudiante)
              sender: msg.sender_id === Number(studentId) ? "user" : "other",
              timestamp: new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              created_at: msg.created_at, // Para ordenar
            }))
            .sort(
              (a: any, b: any) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            ); // Asegurar orden ascendente

          setChatMessages(formattedMessages);
        } else {
          console.error(
            `Fallo al cargar el historial (Status: ${historyResponse.status})`,
            await historyResponse.text() // Usar .text() para ver el cuerpo del error
          );
          setChatMessages([]);
        }
      } catch (error) {
        console.error("Error de red al cargar el historial:", error);
        setChatMessages([]);
      }
    },
    [user]
  ); // Dependencia del usuario logueado
  // 🛑 FIN: FUNCIÓN PARA CARGAR EL HISTORIAL DE CHAT 🛑

  // En page.tsx (donde estaba tu handleSendMessage)

  const handleSendMessage = async () => {
    // 💡 IMPORTANTE: Haz la función ASÍNCRONA
    if (chatMessage.trim() && selectedProperty) {
      const messageContent = chatMessage.trim();

      // 1. Mensaje optimista (se muestra inmediatamente en la UI)
      const newMessage = {
        id: Date.now(),
        text: messageContent,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
      };
      // Añadir el mensaje inmediatamente a la UI
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage(""); // Limpiar el input

      // 2. Llamada a la API de envío
      try {
        const response = await fetch("/api/chat/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Incluir la cookie authToken
          body: JSON.stringify({
            recipientId: selectedProperty.landlordId,
            propertyId: selectedProperty.id,
            content: messageContent,
          }),
        });

        if (!response.ok) {
          console.error("Fallo al enviar el mensaje:", await response.json());
          // 💡 OPCIONAL: Implementar lógica de rollback (ej: eliminar el mensaje optimista si falla)
        }
        // El mensaje se guardó y Pusher lo disparará para los suscriptores.
        // El PusherClient en tu otro useEffect lo recibirá y lo añadirá al estado.
      } catch (error) {
        console.error("Error de red al enviar el mensaje:", error);
        // 💡 OPCIONAL: Implementar lógica de rollback
      }
    }
  };

  useEffect(() => {
    // ⬅️ ESTE BLOQUE SIEMPRE SE EJECUTA cuando los filtros cambian
    const filtersActive = !!selectedCity || !!propertyType || !!priceRange;
    setFiltersActive(filtersActive);
  }, [selectedCity, propertyType, priceRange]); // ⬅️ SOLO LOS FILTROS DEMORADOS

  useEffect(() => {
    // Tarea: Disparar la búsqueda
    fetchProperties();
  }, [fetchProperties]); // ⬅️ Mantenemos solo fetchProperties como dependencia

  // En el useEffect de carga del usuario (Línea 750 aprox.)
  // 🛑 INICIO: EFECTO PARA CARGAR DATOS DEL USUARIO LOGUEADO 🛑
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("http://localhost:3001/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const responseData = await response.json();

          // 💡 ASUMIMOS que el objeto de usuario REAL está en responseData.user
          // Si responseData tiene la forma { success: true, user: { id: 1, ... } }
          const userData = responseData.user || responseData; // Intenta obtener .user o usa el objeto completo

          if (userData && userData.id) {
            // 🚨 LOG DE ÉXITO CORREGIDO 🚨
            console.log("DEBUG AUTH: ✅ Usuario cargado con ID:", userData.id);
            setUser(userData as LoggedInUser);
          } else {
            console.error(
              "DEBUG AUTH: ❌ Usuario cargado, pero ID no encontrado en el payload."
            );
            setUser(null);
          }
        } else {
          // 🚨 LOG DE FALLO DE RESPUESTA 🚨
          console.error(
            "DEBUG AUTH: ❌ Respuesta de auth fallida (4xx/5xx). Status:",
            response.status
          );
          setUser(null);
        }
      } catch (error) {
        // 🚨 LOG DE ERROR DE RED 🚨
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
    // 🛑 Advertencia: Si pusherClient no está inicializado, esta línea fallará.
    // Solo continuar si tenemos usuario, propiedad seleccionada, y Pusher está disponible.
    if (
      !selectedProperty ||
      !user ||
      typeof (window as any).pusherClient === "undefined"
    )
      return;

    const senderId = user.id;
    const recipientId = selectedProperty.landlordId;
    const propertyId = selectedProperty.id;

    // DEBE COINCIDIR CON LA FÓRMULA DEL BACKEND
    const chatRoomId = `private-chat-prop-${propertyId}-${senderId}-${recipientId}`;

    // Acceder a la instancia global (o importada)
    const pusherClient = (window as any).pusherClient;
    const channel = pusherClient.subscribe(chatRoomId);

    const handleNewMessage = (data: any) => {
      const newMessage = {
        id: data.id,
        text: data.content,
        sender: data.sender_id === Number(senderId) ? "user" : "other",
        timestamp: new Date(data.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      // Añadir el nuevo mensaje
      setChatMessages((prev) => [...prev, newMessage]);
    };

    channel.bind("message-sent", handleNewMessage);

    // Función de limpieza
    return () => {
      channel.unbind("message-sent", handleNewMessage);
      pusherClient.unsubscribe(chatRoomId);
    };
  }, [selectedProperty, user]);
  // 🛑 FIN: EFECTO PARA LA SUSCRIPCIÓN EN TIEMPO REAL CON PUSHER 🛑

  // 🛑 NUEVO: EFECTO PARA CARGAR EL HISTORIAL DE CHAT CUANDO EL USUARIO Y LA PROPIEDAD ESTÁN LISTOS 🛑
  useEffect(() => {
    // 1. Validar que tenemos todo lo necesario para llamar a la API
    if (!selectedProperty || !user) {
      // Esto es correcto y detiene la ejecución de forma segura.
      return;
    }

    // Si llegamos aquí, user y selectedProperty tienen valor.
    console.log(
      "DEBUG: 🟢 Ambos (Usuario y Propiedad) están listos. Cargando historial..."
    );

    // 2. Llamar a fetchChatHistory.
    fetchChatHistory(selectedProperty);
  }, [selectedProperty, user, fetchChatHistory]);
  // 🛑 FIN NUEVO useEffect 🛑

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
                  // ⬅️ Debe usar la forma funcional (prev => prev + 1)
                  onClick={() => setSearchTrigger((prev) => prev + 1)}
                  variant="destructive"
                  className="bg-golden hover:bg-education text-white flex-1 font-semibold"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Aplicar Filtros
                </Button>

                {/* BOTÓN PARA ELIMINAR FILTROS (solo se muestra si hay filtros activos) */}
                {filtersActive && (
                  <Button
                    // Código del botón "Eliminar Filtros"
                    onClick={() => {
                      clearFilters(); // Resetea los estados de los filtros
                      setSearchTrigger((prev) => prev + 1); // ⬅️ DISPARA LA NUEVA BÚSQUEDA
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
              // El useEffect con dependencias llamará a fetchProperties automáticamente.
            }}
            // ✅ AGREGA EL VALOR DE VINCULACIÓN: ¡Olvidaste pasar el estado 'value' al Select!
            value={sortOrder}
          >
            {/* 🛑 CORRECCIÓN: SOLO UN SelectTrigger */}
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

                  {/* Ubicación: Ahora muestra la dirección completa y es el enlace al mapa */}
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
                            console.log("Usuario actual al abrir chat:", user);
                            // 1. Solo establecer la propiedad seleccionada.
                            setSelectedProperty(property);
                            // 💡 El historial se cargará automáticamente en el nuevo useEffect.
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
