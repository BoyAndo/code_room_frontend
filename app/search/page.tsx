"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<any[]>([])

  const properties = [
    {
      id: 1,
      title: "Habitación Premium Centro",
      description: "Habitación amoblada en departamento compartido",
      city: "Santiago",
      price: 450,
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=300",
      features: ["1 Dormitorio", "1 Baño", "WiFi", "Amoblado"],
      distance: "5 min a Universidad de Chile",
      author: {
        name: "María González",
        verified: true,
        avatar: "/placeholder.svg?height=40&width=40",
        responseTime: "Responde en ~2 horas",
      },
    },
    {
      id: 2,
      title: "Departamento Estudiantil",
      description: "Departamento completo para 2 estudiantes",
      city: "Valparaíso",
      price: 600,
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
      features: ["2 Dormitorios", "1 Baño", "WiFi", "Cocina"],
      distance: "10 min a PUCV",
      author: {
        name: "Carlos Mendoza",
        verified: true,
        avatar: "/placeholder.svg?height=40&width=40",
        responseTime: "Responde en ~1 hora",
      },
    },
    {
      id: 3,
      title: "Casa Compartida Ñuñoa",
      description: "Casa grande para estudiantes con jardín",
      city: "Santiago",
      price: 380,
      rating: 4.7,
      image: "/placeholder.svg?height=200&width=300",
      features: ["1 Dormitorio", "2 Baños", "WiFi", "Jardín"],
      distance: "15 min a Universidad Católica",
      author: {
        name: "Ana Rodríguez",
        verified: false,
        avatar: "/placeholder.svg?height=40&width=40",
        responseTime: "Responde en ~4 horas",
      },
    },
    {
      id: 4,
      title: "Studio Moderno",
      description: "Studio completamente equipado",
      city: "Concepción",
      price: 520,
      rating: 4.6,
      image: "/placeholder.svg?height=200&width=300",
      features: ["Studio", "1 Baño", "WiFi", "Cocina"],
      distance: "8 min a UdeC",
      author: {
        name: "Pedro Silva",
        verified: true,
        avatar: "/placeholder.svg?height=40&width=40",
        responseTime: "Responde en ~30 min",
      },
    },
  ]

  const handleSendMessage = () => {
    if (chatMessage.trim() && selectedProperty) {
      const newMessage = {
        id: Date.now(),
        text: chatMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
      }
      setChatMessages([...chatMessages, newMessage])
      setChatMessage("")

      // Simular respuesta automática del propietario
      setTimeout(() => {
        const autoReply = {
          id: Date.now() + 1,
          text: "¡Hola! Gracias por tu interés en la propiedad. ¿Te gustaría agendar una visita?",
          sender: "owner",
          timestamp: new Date().toLocaleTimeString(),
        }
        setChatMessages((prev) => [...prev, autoReply])
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-cream/20">
      {/* Header */}
      <header className="bg-white border-b border-sage/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sage to-sage/70 rounded-xl flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-800">Code Room</span>
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
          <h1 className="text-3xl font-bold text-neutral-800 mb-6">Buscar Propiedades</h1>

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
                <Button className="bg-sage hover:bg-sage/90 text-white flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                <Button variant="outline" className="border-sage/30 text-sage hover:bg-sage/10 bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-800">{properties.length} propiedades encontradas</h2>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card
              key={property.id}
              className="bg-white/90 backdrop-blur-sm border-sage/20 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="relative">
                <Image
                  src={property.image || "/placeholder.svg"}
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
                <Badge className="absolute bottom-3 left-3 bg-sage text-white">${property.price}/mes</Badge>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-neutral-800 text-lg">{property.title}</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm text-neutral-600">{property.rating}</span>
                  </div>
                </div>

                <p className="text-neutral-600 text-sm mb-3">{property.description}</p>

                <div className="flex items-center text-sm text-neutral-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.city} • {property.distance}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {property.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-sage/10 text-sage">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <Button className="w-full bg-sage hover:bg-sage/90 text-white mb-3">Ver más detalles</Button>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-3 border-t border-sage/10">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={property.author.avatar || "/placeholder.svg"}
                      alt={property.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-neutral-800">{property.author.name}</span>
                        {property.author.verified ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <span className="text-xs text-neutral-500">{property.author.responseTime}</span>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-sage hover:bg-sage/90 text-white"
                        onClick={() => {
                          setSelectedProperty(property)
                          setChatMessages([])
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
                            src={property.author.avatar || "/placeholder.svg"}
                            alt={property.author.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div>
                            <div className="flex items-center space-x-1">
                              <span>{property.author.name}</span>
                              {property.author.verified ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <span className="text-sm text-neutral-500 font-normal">
                              {property.author.verified ? "Propietario verificado" : "Propietario no verificado"}
                            </span>
                          </div>
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Property Info */}
                        <div className="bg-cream/20 p-3 rounded-lg">
                          <h4 className="font-medium text-neutral-800">{property.title}</h4>
                          <p className="text-sm text-neutral-600">
                            {property.city} • ${property.price}/mes
                          </p>
                        </div>

                        {/* Chat Messages */}
                        <div className="h-64 overflow-y-auto space-y-2 border rounded-lg p-3 bg-neutral-50">
                          {chatMessages.length === 0 ? (
                            <div className="text-center text-neutral-500 text-sm py-8">
                              Inicia la conversación con {property.author.name}
                            </div>
                          ) : (
                            chatMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                                    message.sender === "user" ? "bg-sage text-white" : "bg-white border border-sage/20"
                                  }`}
                                >
                                  <p>{message.text}</p>
                                  <span className="text-xs opacity-70">{message.timestamp}</span>
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
                                e.preventDefault()
                                handleSendMessage()
                              }
                            }}
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!chatMessage.trim()}
                            className="bg-sage hover:bg-sage/90 text-white"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-xs text-neutral-500 text-center">{property.author.responseTime}</div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" className="border-sage/30 text-sage hover:bg-sage/10 bg-transparent">
            Cargar más propiedades
          </Button>
        </div>
      </div>
    </div>
  )
}
