"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Mail,
  FileText,
  Edit,
  LogOut,
  Home,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  MapPin,
  DollarSign,
  Eye,
  MessageCircle,
  Bell,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LandlordProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Carlos Mendoza",
    email: "carlos.mendoza@gmail.com",
    phone: "+56 9 8765 4321",
    documentStatus: "validated" as "pending" | "validated" | "rejected",
  })

  const [newProperty, setNewProperty] = useState({
    title: "",
    description: "",
    city: "",
    address: "",
    price: "",
    type: "",
    bedrooms: "",
    bathrooms: "",
    features: [] as string[],
  })

  const properties = [
    {
      id: 1,
      title: "Habitación Premium Centro",
      description: "Habitación amoblada en departamento compartido",
      city: "Santiago",
      address: "Providencia 1234",
      price: 450,
      type: "Habitación",
      status: "active",
      views: 156,
      messages: 8,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "Departamento Estudiantil",
      description: "Departamento completo para 2 estudiantes",
      city: "Santiago",
      address: "Ñuñoa 567",
      price: 600,
      type: "Departamento",
      status: "active",
      views: 89,
      messages: 12,
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Validado
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazado
          </Badge>
        )
      default:
        return null
    }
  }

  const handleSave = () => {
    setIsEditing(false)
    // Handle save logic here
  }

  const handlePublishProperty = () => {
    // Handle property publishing logic here
    setShowPropertyModal(false)
    setNewProperty({
      title: "",
      description: "",
      city: "",
      address: "",
      price: "",
      type: "",
      bedrooms: "",
      bathrooms: "",
      features: [],
    })
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
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-sage to-sage/70 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-neutral-800">{profileData.name}</CardTitle>
                <p className="text-neutral-600">Arrendador</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">{profileData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-neutral-500" />
                  <div className="flex-1">
                    <p className="text-sm text-neutral-600">Estado del documento:</p>
                    {getStatusBadge(profileData.documentStatus)}
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  <Dialog open={showPropertyModal} onOpenChange={setShowPropertyModal}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-sage hover:bg-sage/90 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Publicar Propiedad
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Publicar Nueva Propiedad</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="title">Título de la propiedad</Label>
                            <Input
                              id="title"
                              value={newProperty.title}
                              onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                              placeholder="Ej: Habitación Premium Centro"
                              className="border-sage/30 focus:border-sage focus:ring-sage/20"
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Precio mensual (USD)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={newProperty.price}
                              onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                              placeholder="450"
                              className="border-sage/30 focus:border-sage focus:ring-sage/20"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea
                            id="description"
                            value={newProperty.description}
                            onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                            placeholder="Describe tu propiedad..."
                            className="border-sage/30 focus:border-sage focus:ring-sage/20"
                            rows={3}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">Ciudad</Label>
                            <Select
                              value={newProperty.city}
                              onValueChange={(value) => setNewProperty({ ...newProperty, city: value })}
                            >
                              <SelectTrigger className="border-sage/30 focus:border-sage focus:ring-sage/20">
                                <SelectValue placeholder="Selecciona ciudad" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="santiago">Santiago</SelectItem>
                                <SelectItem value="valparaiso">Valparaíso</SelectItem>
                                <SelectItem value="concepcion">Concepción</SelectItem>
                                <SelectItem value="temuco">Temuco</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="type">Tipo de propiedad</Label>
                            <Select
                              value={newProperty.type}
                              onValueChange={(value) => setNewProperty({ ...newProperty, type: value })}
                            >
                              <SelectTrigger className="border-sage/30 focus:border-sage focus:ring-sage/20">
                                <SelectValue placeholder="Selecciona tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="room">Habitación</SelectItem>
                                <SelectItem value="apartment">Departamento</SelectItem>
                                <SelectItem value="house">Casa</SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="address">Dirección</Label>
                          <Input
                            id="address"
                            value={newProperty.address}
                            onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                            placeholder="Calle y número"
                            className="border-sage/30 focus:border-sage focus:ring-sage/20"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="bedrooms">Dormitorios</Label>
                            <Input
                              id="bedrooms"
                              type="number"
                              value={newProperty.bedrooms}
                              onChange={(e) => setNewProperty({ ...newProperty, bedrooms: e.target.value })}
                              placeholder="1"
                              className="border-sage/30 focus:border-sage focus:ring-sage/20"
                            />
                          </div>
                          <div>
                            <Label htmlFor="bathrooms">Baños</Label>
                            <Input
                              id="bathrooms"
                              type="number"
                              value={newProperty.bathrooms}
                              onChange={(e) => setNewProperty({ ...newProperty, bathrooms: e.target.value })}
                              placeholder="1"
                              className="border-sage/30 focus:border-sage focus:ring-sage/20"
                            />
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <Button
                            onClick={handlePublishProperty}
                            className="flex-1 bg-sage hover:bg-sage/90 text-white"
                          >
                            Publicar Propiedad
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowPropertyModal(false)}
                            className="border-sage/30 text-sage hover:bg-sage/10"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    className="w-full border-sage/30 text-sage hover:bg-sage/10"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancelar" : "Editar Perfil"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Information */}
            <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-neutral-800">Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="border-sage/30 focus:border-sage focus:ring-sage/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="border-sage/30 focus:border-sage focus:ring-sage/20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="border-sage/30 focus:border-sage focus:ring-sage/20"
                      />
                    </div>
                    <Button onClick={handleSave} className="bg-sage hover:bg-sage/90 text-white">
                      Guardar Cambios
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-neutral-700">Nombre completo</Label>
                        <p className="text-neutral-800 font-medium">{profileData.name}</p>
                      </div>
                      <div>
                        <Label className="text-neutral-700">Correo electrónico</Label>
                        <p className="text-neutral-800 font-medium">{profileData.email}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-neutral-700">Teléfono</Label>
                        <p className="text-neutral-800 font-medium">{profileData.phone}</p>
                      </div>
                      <div>
                        <Label className="text-neutral-700">Estado de verificación</Label>
                        {getStatusBadge(profileData.documentStatus)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Properties Management */}
            <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-neutral-800">Mis Propiedades</CardTitle>
                  <Badge variant="secondary" className="bg-sage/10 text-sage">
                    {properties.length} propiedades
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {properties.map((property) => (
                    <Card key={property.id} className="border border-sage/20">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Image
                            src={property.image || "/placeholder.svg"}
                            alt={property.title}
                            width={120}
                            height={80}
                            className="rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-neutral-800">{property.title}</h3>
                                <p className="text-sm text-neutral-600">{property.description}</p>
                              </div>
                              <Badge className="bg-green-100 text-green-800 border-green-200">Activa</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {property.city}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />${property.price}/mes
                              </div>
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {property.views} vistas
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {property.messages} mensajes
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-sage/30 text-sage hover:bg-sage/10 bg-transparent"
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-sage/30 text-sage hover:bg-sage/10 bg-transparent"
                              >
                                Ver detalles
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                              >
                                Pausar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {properties.length === 0 && (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">No tienes propiedades publicadas</h3>
                    <p className="text-neutral-600 mb-4">Comienza publicando tu primera propiedad</p>
                    <Button onClick={() => setShowPropertyModal(true)} className="bg-sage hover:bg-sage/90 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Publicar Primera Propiedad
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-sage mb-2">245</div>
                  <div className="text-sm text-neutral-600">Vistas totales</div>
                </CardContent>
              </Card>
              <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-sage mb-2">20</div>
                  <div className="text-sm text-neutral-600">Mensajes recibidos</div>
                </CardContent>
              </Card>
              <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-sage mb-2">4.8★</div>
                  <div className="text-sm text-neutral-600">Calificación promedio</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
