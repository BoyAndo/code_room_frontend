"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Bell,
  Heart,
  MessageCircle,
  Search,
  GraduationCap,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from '@/contexts/AuthContext' // Importa el hook de autenticación
import { useRouter } from "next/navigation"

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const { user, logout } = useAuth() // Obtén el usuario y función de logout del contexto
  const router = useRouter()

  // Usar datos reales del usuario o datos por defecto
  const [profileData, setProfileData] = useState({
    name: user?.studentName || "Nombre no disponible",
    email: user?.studentEmail || "Email no disponible",
    university: user?.studentCollege || "Universidad no especificada",
    career: "Ingeniería Comercial", // Esto podría venir de tu base de datos
    documentStatus: "validated" as "pending" | "validated" | "rejected",
  })

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleSave = () => {
    setIsEditing(false)
    // Aquí podrías agregar una llamada a la API para actualizar los datos
    // api.post("/auth/update-profile", profileData)
  }

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

  // Si no hay usuario, muestra un mensaje de carga o redirige
  if (!user) {
    return (
      <div className="min-h-screen bg-cream/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando perfil...</p>
        </div>
      </div>
    )
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
              <Link href="/search">
                <Button variant="ghost" size="sm">
                  <Search className="h-5 w-5 text-neutral-600" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5 text-neutral-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-sage to-sage/70 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-neutral-800">{profileData.name}</CardTitle>
                <p className="text-neutral-600">Estudiante</p>
                <p className="text-sm text-sage font-medium">{user.studentRut}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">{profileData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <GraduationCap className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-600">{profileData.university}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-neutral-500" />
                  <div className="flex-1">
                    <p className="text-sm text-neutral-600">Estado del documento:</p>
                    {getStatusBadge(profileData.documentStatus)}
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full bg-sage hover:bg-sage/90 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancelar" : "Editar Perfil"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-neutral-800">Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
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
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="border-sage/30 focus:border-sage focus:ring-sage/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="university">Universidad</Label>
                      <Input
                        id="university"
                        value={profileData.university}
                        onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                        className="border-sage/30 focus:border-sage focus:ring-sage/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="career">Carrera</Label>
                      <Input
                        id="career"
                        value={profileData.career}
                        onChange={(e) => setProfileData({ ...profileData, career: e.target.value })}
                        className="border-sage/30 focus:border-sage focus:ring-sage/20"
                      />
                    </div>
                    <Button onClick={handleSave} className="bg-sage hover:bg-sage/90 text-white">
                      Guardar Cambios
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-neutral-700">Nombre completo</Label>
                      <p className="text-neutral-800 font-medium">{profileData.name}</p>
                    </div>
                    <div>
                      <Label className="text-neutral-700">Correo electrónico</Label>
                      <p className="text-neutral-800 font-medium">{profileData.email}</p>
                    </div>
                    <div>
                      <Label className="text-neutral-700">RUT</Label>
                      <p className="text-neutral-800 font-medium">{user.studentRut}</p>
                    </div>
                    <div>
                      <Label className="text-neutral-700">Universidad</Label>
                      <p className="text-neutral-800 font-medium">{profileData.university}</p>
                    </div>
                    <div>
                      <Label className="text-neutral-700">Carrera</Label>
                      <p className="text-neutral-800 font-medium">{profileData.career}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Status */}
            <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-neutral-800">Estado de Verificación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Certificado de Alumno Regular</p>
                      <p className="text-sm text-green-600">Documento verificado correctamente</p>
                    </div>
                  </div>
                  {getStatusBadge(profileData.documentStatus)}
                </div>
                {user.studentCertificateUrl && (
                  <div className="mt-4">
                    <Label className="text-neutral-700">Certificado subido:</Label>
                    <a 
                      href={user.studentCertificateUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sage hover:text-sage/80 underline text-sm block mt-1"
                    >
                      Ver certificado
                    </a>
                  </div>
                )}
                {profileData.documentStatus === "validated" && (
                  <p className="text-sm text-neutral-600 mt-3">
                    ¡Perfecto! Tu documento ha sido verificado. Ya puedes buscar y contactar propiedades.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-neutral-800">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Link href="/search">
                    <Button
                      variant="outline"
                      className="w-full border-sage/30 text-sage hover:bg-sage/10 bg-transparent"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Buscar Propiedades
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full border-sage/30 text-sage hover:bg-sage/10 bg-transparent">
                    <Heart className="h-4 w-4 mr-2" />
                    Mis Favoritos
                  </Button>
                  <Button variant="outline" className="w-full border-sage/30 text-sage hover:bg-sage/10 bg-transparent">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mensajes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}