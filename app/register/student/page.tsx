"use client";

import React, { useState, useEffect } from "react";
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
  GraduationCap,
  School,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; // Importa el hook
import { RegionCommuneSelect } from "@/components/RegionCommuneSelect";

export default function StudentRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // ✅ Estado separado para confirmación
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState(""); // ✅ Estado para error de contraseña
  const [confirmPasswordError, setConfirmPasswordError] = useState(""); // ✅ Estado para error de confirmación
  const router = useRouter();
  const { login, user } = useAuth();
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(false);

  // Redirige automáticamente cuando el usuario se actualiza tras login
  useEffect(() => {
    if (redirectAfterLogin && user) {
      router.push("/profile");
    }
  }, [redirectAfterLogin, user, router]);

  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    studentRut: "",
    password: "",
    confirmPassword: "", // ✅ Campo de confirmación de contraseña
    studentCollege: "Duoc UC", // ✅ Valor por defecto bloqueado
  });

  // Estados para región y comuna
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedComunaId, setSelectedComunaId] = useState<number | null>(null);
  const [selectedRegionName, setSelectedRegionName] = useState<string>("");
  const [selectedComunaName, setSelectedComunaName] = useState<string>("");
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

  // ✅ Función para validar contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;

    if (newPassword.length > 12) {
      setPasswordError("La contraseña no puede exceder 12 caracteres");
      return; // No actualizar el estado si excede el límite
    }

    setPasswordError(""); // Limpiar error si está dentro del límite
    setFormData({ ...formData, password: newPassword });

    // Validar confirmación si ya hay una confirmación escrita
    if (formData.confirmPassword && newPassword !== formData.confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
    } else {
      setConfirmPasswordError("");
    }
  };

  // ✅ Función para validar confirmación de contraseña
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const confirmPassword = e.target.value;

    if (confirmPassword.length > 12) {
      setConfirmPasswordError("La contraseña no puede exceder 12 caracteres");
      return;
    }

    setFormData({ ...formData, confirmPassword });

    // Validar si coincide con la contraseña principal
    if (formData.password && confirmPassword !== formData.password) {
      setConfirmPasswordError("Las contraseñas no coinciden");
    } else {
      setConfirmPasswordError("");
    }
  };
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ Validar que las contraseñas coincidan
      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }

      if (!certificateFile) {
        setError("Por favor, sube tu certificado de alumno regular");
        setLoading(false);
        return;
      }

      // Crear FormData para enviar archivo
      const formDataToSend = new FormData();
      formDataToSend.append("studentName", formData.studentName);
      formDataToSend.append("studentEmail", formData.studentEmail);
      formDataToSend.append("studentRut", formData.studentRut);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("studentCollege", formData.studentCollege);
      formDataToSend.append("studentCertificateUrl", certificateFile);

      // Agregar campos de ubicación (opcionales)
      if (selectedRegionId) {
        formDataToSend.append("regionId", selectedRegionId.toString());
      }
      if (selectedComunaId) {
        formDataToSend.append("comunaId", selectedComunaId.toString());
      }
      // Agregar nombres para validación OCR
      if (selectedRegionName) {
        formDataToSend.append("regionName", selectedRegionName);
      }
      if (selectedComunaName) {
        formDataToSend.append("comunaName", selectedComunaName);
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/auth/students-register`,
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
            // Forzar actualización del contexto
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
    setCertificateFile(file);
  };

  return (
    <div className="min-h-screen code-room-subtle-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-golden to-education rounded-xl flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-neutral-800">URoom</span>
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-8 w-8 text-sage" />
            <h1 className="text-2xl font-bold text-neutral-800">
              Registro de Estudiante
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
              Información del Estudiante
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Name */}
              <div className="space-y-2">
                <Label htmlFor="studentName" className="text-neutral-700">
                  Nombre completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="studentName"
                    type="text"
                    placeholder="Tu nombre completo"
                    value={formData.studentName}
                    onChange={(e) =>
                      setFormData({ ...formData, studentName: e.target.value })
                    }
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                </div>
              </div>

              {/* Student RUT */}
              <div className="space-y-2">
                <Label htmlFor="studentRut" className="text-neutral-700">
                  RUT
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="studentRut"
                    type="text"
                    placeholder="12.345.678-9"
                    value={formData.studentRut}
                    onChange={(e) =>
                      setFormData({ ...formData, studentRut: e.target.value })
                    }
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                </div>
              </div>

              {/* Student Email */}
              <div className="space-y-2">
                <Label htmlFor="studentEmail" className="text-neutral-700">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="studentEmail"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.studentEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, studentEmail: e.target.value })
                    }
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="">
                <Label htmlFor="password" className="text-neutral-700">
                  Contraseña{" "}
                  <span className="text-sm text-neutral-500">
                    (máx. 12 caracteres)
                  </span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crea una contraseña segura"
                    value={formData.password}
                    onChange={handlePasswordChange} // ✅ Usar nueva función de validación
                    maxLength={12} // ✅ Límite HTML adicional
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
                {/* Mostrar alerta de error de contraseña */}
                {passwordError && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    {passwordError}
                  </p>
                )}
                {/* ✅ Contador de caracteres */}
                <p className="text-xs text-neutral-500 text-right">
                  {formData.password.length}/12 caracteres
                </p>
              </div>

              {/* ✅ Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-neutral-700">
                  Confirmar contraseña{" "}
                  <span className="text-sm text-neutral-500">
                    (máx. 12 caracteres)
                  </span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    maxLength={12}
                    className="pl-10 pr-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {/* ✅ Mostrar alerta de error de confirmación */}
                {confirmPasswordError && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    {confirmPasswordError}
                  </p>
                )}
                {/* ✅ Contador de caracteres */}
                <p className="text-xs text-neutral-500 text-right">
                  {formData.confirmPassword.length}/12 caracteres
                </p>
              </div>

              {/* Student College */}
              <div className="space-y-2">
                <Label htmlFor="studentCollege" className="text-neutral-700">
                  Universidad/Instituto
                </Label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="studentCollege"
                    type="text"
                    value={formData.studentCollege} // ✅ Solo valor, sin placeholder
                    readOnly // ✅ Campo bloqueado
                    className="pl-10 border-sage/30 bg-neutral-50 text-neutral-700 cursor-not-allowed" // ✅ Estilo de campo bloqueado
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

              {/* Student Certificate */}
              <div className="space-y-2">
                <Label
                  htmlFor="studentCertificate"
                  className="text-neutral-700"
                >
                  Certificado de alumno regular (PDF)
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="studentCertificate"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="pl-10 pb-5 border-sage/30 focus:border-sage focus:ring-sage/20 file:mr-4  file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sage/10 file:text-sage hover:file:bg-sage/20"
                    required
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  Sube tu certificado de alumno regular en formato PDF para
                  verificar tu condición de estudiante
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-golden hover:bg-education text-white py-3 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Crear Cuenta de Estudiante"}
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

        {/* Additional Options */}
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
