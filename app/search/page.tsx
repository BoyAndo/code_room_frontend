"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
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

interface Property {
  id: number;
  landlordId: number;
  title: string;
  description: string;
  address: string;
  comuna: string;
  region: string;
  zipCode: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  monthlyRent: string;
  isAvailable: boolean;
  utilityBillUrl: string;
  utilityBillValidated: boolean;
  rules: string;
  latitude: string;
  longitude: string;
  createdAt: string;
  updatedAt: string;
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

export default function SearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:3002/api/properties/with-landlord",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data.properties; // Nueva estructura anidada
      console.log("Fetched properties:", data);

      // Los datos ya vienen en el formato correcto de la interfaz Property
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // useEffect separado para monitorear cambios en properties
  useEffect(() => {
    console.log("Properties state updated:", properties);
  }, [properties]);

  const handleSendMessage = () => {
    if (chatMessage.trim() && selectedProperty) {
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

  return (
    <div className="min-h-screen code-room-subtle-pattern">
      {/* Header */}
      <header className="bg-white border-b border-sage/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sage to-sage/70 rounded-xl flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-800">
                Code Room
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5 text-neutral-600" />
              </Button>
              <Link href="/profile/student">
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
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    placeholder="Buscar por ciudad..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                  />
                </div>

                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="border-sage/30 focus:border-sage focus:ring-sage/20">
                    <SelectValue placeholder="Ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="santiago">Santiago</SelectItem>
                    <SelectItem value="valparaiso">Valparaíso</SelectItem>
                    <SelectItem value="concepcion">Concepción</SelectItem>
                    <SelectItem value="temuco">Temuco</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="border-sage/30 focus:border-sage focus:ring-sage/20">
                    <SelectValue placeholder="Tipo de propiedad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="room">Habitación</SelectItem>
                    <SelectItem value="apartment">Departamento</SelectItem>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="border-sage/30 focus:border-sage focus:ring-sage/20">
                    <SelectValue placeholder="Rango de precio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-300">$0 - $300</SelectItem>
                    <SelectItem value="300-500">$300 - $500</SelectItem>
                    <SelectItem value="500-700">$500 - $700</SelectItem>
                    <SelectItem value="700+">$700+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button className="bg-golden hover:bg-education text-white flex-1 font-semibold">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                <Button
                  variant="outline"
                  className="border-sage/30 text-sage hover:bg-warm bg-white"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-800">
            {properties?.length || 0} propiedades encontradas
          </h2>
          <Select defaultValue="relevance">
            <SelectTrigger className="w-48 border-sage/30">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevancia</SelectItem>
              <SelectItem value="price-low">Precio: Menor a mayor</SelectItem>
              <SelectItem value="price-high">Precio: Mayor a menor</SelectItem>
              <SelectItem value="rating">Mejor calificación</SelectItem>
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
                    {property.comuna}, {property.region}
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
                        {getAmenityIcon(amenity.icon)}
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

                  <Button className="w-full bg-golden hover:bg-education text-white mb-3 font-semibold">
                    Ver más detalles
                  </Button>

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
                        <span className="text-xs text-neutral-500">
                          Responde en ~2 horas
                        </span>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-golden hover:bg-education text-white font-semibold"
                          onClick={() => {
                            setSelectedProperty(property);
                            setChatMessages([]);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
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
                            {property.rules && (
                              <p className="text-xs text-neutral-500 mt-2 italic">
                                📋 {property.rules}
                              </p>
                            )}
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-sage/30 text-sage hover:bg-warm bg-white"
          >
            Cargar más propiedades
          </Button>
        </div>
      </div>
    </div>
  );
}
