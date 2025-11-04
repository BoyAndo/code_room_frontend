"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Phone,
  DollarSign,
} from "lucide-react";
import { useAuth, isLandlord } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  documentStatus: "pending" | "validated" | "rejected";
}

export const LandlordProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    documentStatus: "validated" as const,
  });

  useEffect(() => {
    if (isLandlord(user)) {
      setProfileData({
        name: user.landlordName || "",
        email: user.landlordEmail || "",
        phone: user.phone || "",
        documentStatus: "validated",
      });
    }
  }, [user]);

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

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("photo", file);

      const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_URL}/profile/landlord/photo`, {
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
      if (data.success && isLandlord(user)) {
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

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-golden to-education rounded-full flex items-center justify-center mb-3 overflow-hidden">
                  {user?.profilePhotoUrl ? (
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
                  ref={inputRef}
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
                    console.log("Button clicked, inputRef:", inputRef.current);
                    inputRef.current?.click();
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
              <p className="text-neutral-600 mb-1">Propietario</p>
              <p className="text-sm text-sage font-medium mb-4">
                {isLandlord(user) ? user.landlordRut : ""}
              </p>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-golden hover:bg-education text-white font-semibold"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancelar" : "Editar Perfil"}
              </Button>
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
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      phone: e.target.value,
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
                  {isLandlord(user) ? user.landlordRut : ""}
                </p>
              </div>
              <div>
                <Label className="text-neutral-700">Teléfono</Label>
                <p className="text-neutral-800 font-medium">
                  {profileData.phone}
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
                  Cuenta de Propietario
                </p>
                <p className="text-sm text-blue-600">
                  Tu cuenta ha sido verificada correctamente
                </p>
              </div>
            </div>
            {getStatusBadge(profileData.documentStatus)}
          </div>
          {isLandlord(user) && user.landlordDocumentUrl && (
            <div className="mt-4">
              <Label className="text-neutral-700">
                Documento de identidad:
              </Label>
              <a
                href={user.landlordDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage hover:text-sage/80 underline text-sm block mt-1"
              >
                Ver documento
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-neutral-800">
            Estadísticas de Propiedades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-cream/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="h-5 w-5 text-sage" />
                <span className="text-2xl font-bold text-sage">4</span>
              </div>
              <p className="text-sm text-neutral-600">Propiedades Activas</p>
            </div>
            <div className="p-4 bg-cream/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-sage" />
                <span className="text-2xl font-bold text-sage">$2.5M</span>
              </div>
              <p className="text-sm text-neutral-600">Ingresos Mensuales</p>
            </div>
            <div className="p-4 bg-cream/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Mail className="h-5 w-5 text-sage" />
                <span className="text-2xl font-bold text-sage">12</span>
              </div>
              <p className="text-sm text-neutral-600">Mensajes Nuevos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};