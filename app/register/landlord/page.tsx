"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Home,
  Mail,
  Lock,
  User,
  FileText,
  Eye,
  EyeOff,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";

export default function LandlordRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    landlordName: "",
    landlordEmail: "",
    landlordRut: "",
    password: "",
    confirmPassword: "",
  });

  // Estados para región y comuna
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedComunaId, setSelectedComunaId] = useState<number | null>(null);
  const [selectedRegionName, setSelectedRegionName] = useState<string>("");
  const [selectedComunaName, setSelectedComunaName] = useState<string>("");

  const [carnetFile, setCarnetFile] = useState<File | null>(null);

  // Handlers para región y comuna que reciben tanto ID como nombre
  const handleRegionChange = (
    regionId: number | null,
    regionName?: string | null
  ) => {
    setSelectedRegionId(regionId);
    setSelectedRegionName(regionName || "");
    // Reset comuna when region changes
    setSelectedComunaId(null);
    setSelectedComunaName("");
  };

  const handleComunaChange = (
    comunaId: number | null,
    comunaName?: string | null
  ) => {
    setSelectedComunaId(comunaId);
    setSelectedComunaName(comunaName || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    if (!carnetFile) {
      setError("Por favor, sube una foto de tu carnet");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("landlordName", formData.landlordName);
      formDataToSend.append("landlordRut", formData.landlordRut);
      formDataToSend.append("landlordEmail", formData.landlordEmail);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("landlordCarnet", carnetFile);

      // Agregar campos de ubicación (opcionales)
      if (selectedRegionId) {
        formDataToSend.append("regionId", selectedRegionId.toString());
      }
      if (selectedComunaId) {
        formDataToSend.append("comunaId", selectedComunaId.toString());
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/auth/landlords-register`,
        {
          method: "POST",
          body: formDataToSend,
          credentials: "include", // ✅ Para recibir cookies httpOnly
        }
      );

      if (response.ok) {
        const data = await response.json();
        await login();
        // Redirige según el usuario actualizado en el contexto
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = "/profile";
          }
        }, 300);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error en el registro");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCarnetFile(file);
  };

  return (
    <div className="min-h-screen code-room-subtle-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-sage to-sage/70 rounded-xl flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-neutral-800">
              Code Room
            </span>
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-sage" />
            <h1 className="text-2xl font-bold text-neutral-800">
              Registro de Arrendador
            </h1>
          </div>
          <p className="text-neutral-600">
            Completa tus datos para crear tu cuenta
          </p>
        </div>

        {/* Registration Form */}
        <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-neutral-800">
              Información del Arrendador
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre completo */}
              <div className="space-y-2">
                <Label htmlFor="landlordName" className="text-neutral-700">
                  Nombre completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="landlordName"
                    type="text"
                    placeholder="Tu nombre completo"
                    value={formData.landlordName}
                    onChange={(e) =>
                      setFormData({ ...formData, landlordName: e.target.value })
                    }
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                </div>
              </div>

              {/* RUT */}
              <div className="space-y-2">
                <Label htmlFor="landlordRut" className="text-neutral-700">
                  RUT
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="landlordRut"
                    type="text"
                    placeholder="12.345.678-9"
                    value={formData.landlordRut}
                    onChange={(e) =>
                      setFormData({ ...formData, landlordRut: e.target.value })
                    }
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                </div>
              </div>

              {/* Correo electrónico */}
              <div className="space-y-2">
                <Label htmlFor="landlordEmail" className="text-neutral-700">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="landlordEmail"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.landlordEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        landlordEmail: e.target.value,
                      })
                    }
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-neutral-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crea una contraseña segura"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10 pr-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-neutral-700">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="pl-10 pr-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                </div>
              </div>

              {/* Ubicación - Región y Comuna */}
              <RegionCommuneSelect
                selectedRegionId={selectedRegionId}
                selectedComunaId={selectedComunaId}
                onRegionChange={handleRegionChange}
                onComunaChange={handleComunaChange}
                required={false}
                className="mt-4"
              />

              {/* Carnet de identidad */}
              <div className="space-y-2">
                <Label htmlFor="landlordCarnet" className="text-neutral-700">
                  Foto de carnet de identidad (JPG, PNG)
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="landlordCarnet"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20 file:mr-4  file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sage/10 file:text-sage hover:file:bg-sage/20"
                    required
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  Sube una foto clara de tu carnet de identidad (JPG, PNG)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-golden hover:bg-education text-white py-3 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Crear Cuenta de Arrendador"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-neutral-600">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/login"
                  className="text-sage hover:text-sage/80 font-semibold"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/register"
            className="text-neutral-600 hover:text-sage text-sm"
          >
            ← Volver a selección de tipo
          </Link>
        </div>
      </div>
    </div>
  );
}
