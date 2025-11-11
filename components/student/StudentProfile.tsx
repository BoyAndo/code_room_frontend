"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";
import {
  User,
  School,
  Mail,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Bookmark,
  Building2,
  MessageCircle,
  Trash2,
  LogOut,
  Search,
} from "lucide-react";
import { useAuth, isStudent } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";
import { useRouter } from "next/navigation";

interface ProfileData {
  name: string;
  email: string;
  college: string;
  documentStatus: "pending" | "validated" | "rejected";
}

export const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    college: "",
    documentStatus: "validated" as const,
  });

  useEffect(() => {
    if (isStudent(user)) {
      setProfileData({
        name: user.studentName || "",
        email: user.studentEmail || "",
        college: user.studentCollege || "",
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

    console.log("File selected:", file.name, file.type, file.size);

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("photo", file);

      const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3001";
      console.log("Uploading to:", `${API_URL}/profile/student/photo`);
      
      const response = await apiFetch(`${API_URL}/profile/student/photo`, {
        method: "POST",
        body: formData,
        headers: {
          // No incluir Content-Type para FormData, el navegador lo establece automáticamente
        },
      });

      console.log("Response status:", response.status);
      console.log("Response URL:", response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Error al subir la foto");
      }

      const data = await response.json();
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

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3001";
      const response = await apiFetch(`${API_URL}/user/student`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la cuenta");
      }

      const data = await response.json();

      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada exitosamente.",
      });

      // Hacer logout y redirigir
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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
              <p className="text-neutral-600 mb-1">Estudiante</p>
              <p className="text-sm text-education font-medium mb-4">
                {isStudent(user) ? user.studentRut : ""}
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
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
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
                <p className="text-neutral-800 font-medium">{profileData.name}</p>
              </div>
              <div>
                <Label className="text-neutral-700">Correo electrónico</Label>
                <p className="text-neutral-800 font-medium">{profileData.email}</p>
              </div>
              <div>
                <Label className="text-neutral-700">RUT</Label>
                <p className="text-neutral-800 font-medium">
                  {isStudent(user) ? user.studentRut : ""}
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
                  Cuenta de Estudiante
                </p>
                <p className="text-sm text-blue-600">
                  Tu cuenta ha sido verificada correctamente
                </p>
              </div>
            </div>
            {getStatusBadge(profileData.documentStatus)}
          </div>
          {isStudent(user) && user.studentCertificateUrl && (
            <div className="mt-4">
              <Label className="text-neutral-700">
                Certificado de alumno regular:
              </Label>
              <a
                href={user.studentCertificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-education hover:text-education/80 underline text-sm block mt-1"
              >
                Ver certificado
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-neutral-800">
            Acciones Recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/search" className="w-full">
              <Button
                variant="outline"
                className="w-full border-sage/30 text-sage hover:bg-sage/10"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar Propiedades
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full border-sage/30 text-sage hover:bg-sage/10"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Mensajes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone - Delete Account */}
      <Card className="bg-white backdrop-blur-sm border-red-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Zona Peligrosa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-neutral-600">
              Esta acción es permanente e irreversible. Se eliminarán todos tus
              datos, preferencias guardadas y actividad en la plataforma.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full md:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Cuenta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteAccount}
        userType="student"
        isDeleting={isDeleting}
      />
    </div>
  );
};