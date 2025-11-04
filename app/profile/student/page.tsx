"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useAuth, isStudent } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    documentStatus: "validated" as "pending" | "validated" | "rejected",
  });

  useEffect(() => {
    if (isStudent(user)) {
      setProfileData({
        name: user.studentName || "",
        email: user.studentEmail || "",
        phone: "", // Agregar si es necesario
        college: user.studentCollege || "",
        documentStatus: "validated",
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSave = async () => {
    try {
      // Aquí implementar la llamada a la API para actualizar los datos
      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("File selected:", file.name, file.type, file.size);

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("photo", file);

      const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3001";
      console.log("Uploading to:", `${API_URL}/profile/student/photo`);
      
      const response = await fetch(`${API_URL}/profile/student/photo`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      console.log("Response status:", response.status);
      console.log("Response URL:", response.url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Error al subir la foto");
      }

      const data = await response.json();
      
      // Actualizar el usuario en el contexto con la nueva foto
      if (data.success && isStudent(user)) {
        const updatedUser = {
          ...user,
          profilePhotoUrl: data.data.profilePhotoUrl,
        };
        updateUser(updatedUser);
      }

      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada exitosamente.",
      });
    } catch (error) {
      console.error("Error al actualizar foto:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la foto de perfil.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Validado
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazado
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!user || !isStudent(user)) {
    return (
      <div className="min-h-screen bg-cream/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream/20">
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
        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-golden to-education rounded-full flex items-center justify-center mb-3 overflow-hidden">
                      {user.profilePhotoUrl ? (
                        <img
                          src={user.profilePhotoUrl}
                          alt="Foto de perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-white" />
                      )}
                    </div>
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs border-sage/30 text-sage hover:bg-sage/10"
                      disabled={isUploading}
                      onClick={(e) => {
                        e.preventDefault();
                        console.log("Button clicked!");
                        document.getElementById('photo-upload')?.click();
                      }}
                    >
                      {isUploading ? "Subiendo..." : "Cambiar foto"}
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-neutral-800 mb-2">
                    {profileData.name}
                  </CardTitle>
                  <p className="text-neutral-600 mb-1">Estudiante</p>
                  <p className="text-sm text-sage font-medium mb-4">
                    {user.studentRut}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-golden hover:bg-education text-white font-semibold"
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing ? "Cancelar" : "Editar Perfil"}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                      onClick={handleLogout}
                      size="sm"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          name: e.target.value,
                        })
                      }
                      className="border-sage/30 focus:border-sage focus:ring-sage/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className="border-sage/30 focus:border-sage focus:ring-sage/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="college">Universidad</Label>
                    <Input
                      id="college"
                      value={profileData.college}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          college: e.target.value,
                        })
                      }
                      className="border-sage/30 focus:border-sage focus:ring-sage/20"
                    />
                  </div>
                  <Button
                    onClick={handleSave}
                    className="bg-golden hover:bg-education text-white font-semibold"
                  >
                    Guardar Cambios
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-neutral-700">Nombre completo</Label>
                    <p className="text-neutral-800 font-medium">
                      {profileData.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-neutral-700">
                      Correo electrónico
                    </Label>
                    <p className="text-neutral-800 font-medium">
                      {profileData.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-neutral-700">RUT</Label>
                    <p className="text-neutral-800 font-medium">
                      {user.studentRut}
                    </p>
                  </div>
                  <div>
                    <Label className="text-neutral-700">Universidad</Label>
                    <p className="text-neutral-800 font-medium">
                      {profileData.college}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Status */}
          <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-neutral-800">
                Estado de Verificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">
                      Certificado de Alumno Regular
                    </p>
                    <p className="text-sm text-blue-600">
                      Documento verificado correctamente
                    </p>
                  </div>
                </div>
                {getStatusBadge(profileData.documentStatus)}
              </div>
              {user.studentCertificateUrl && (
                <div className="mt-4">
                  <Label className="text-neutral-700">
                    Certificado subido:
                  </Label>
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
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-neutral-800">
                Acciones Rápidas
              </CardTitle>
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
                <Button
                  variant="outline"
                  className="w-full border-sage/30 text-sage hover:bg-sage/10 bg-transparent"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Mis Favoritos
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-sage/30 text-sage hover:bg-sage/10 bg-transparent"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Mensajes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
