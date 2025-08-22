"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Home, Mail, Lock, User, FileText, Eye, EyeOff, GraduationCap, School } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuth } from '@/contexts/AuthContext' // Importa el hook

export default function StudentRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth() // Obtén la función login del contexto

  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    studentRut: "",
    password: "",
    studentCollege: "",
  })

  const [certificateFile, setCertificateFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!certificateFile) {
        setError("Por favor, sube tu certificado de alumno regular")
        setLoading(false)
        return
      }

      // Crear FormData para enviar archivo
      const formDataToSend = new FormData()
      formDataToSend.append("studentName", formData.studentName)
      formDataToSend.append("studentEmail", formData.studentEmail)
      formDataToSend.append("studentRut", formData.studentRut)
      formDataToSend.append("password", formData.password)
      formDataToSend.append("studentCollege", formData.studentCollege)
      formDataToSend.append("studentCertificateUrl", certificateFile)

      const response = await api.post("/auth/students-register", formDataToSend, true)

      if (response.ok) {
        const data = await response.json()
        
        // Guardar token en localStorage y en el contexto
        if (data.token) {
          localStorage.setItem("authToken", data.token)
          login(data.token) // ← AQUÍ LLAMAS A LA FUNCIÓN DEL CONTEXTO
        }
        
        // Redirigir al dashboard o página de éxito
        router.push("/profile/student")
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Error en el registro")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error de conexión. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setCertificateFile(file)
  }

  return (
    <div className="min-h-screen bg-cream/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-sage to-sage/70 rounded-xl flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-neutral-800">Code Room</span>
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-8 w-8 text-sage" />
            <h1 className="text-2xl font-bold text-neutral-800">Registro de Estudiante</h1>
          </div>
          <p className="text-neutral-600">Completa tus datos para crear tu cuenta</p>
        </div>

        {/* Registration Form */}
        <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-neutral-800">Información del Estudiante</CardTitle>
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
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, studentRut: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                </div>
              </div>

              {/* Password */}
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
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
                    placeholder="Nombre de tu institución educativa"
                    value={formData.studentCollege}
                    onChange={(e) => setFormData({ ...formData, studentCollege: e.target.value })}
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                </div>
              </div>

              {/* Student Certificate */}
              <div className="space-y-2">
                <Label htmlFor="studentCertificate" className="text-neutral-700">
                  Certificado de alumno regular (PDF)
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="studentCertificate"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sage/10 file:text-sage hover:file:bg-sage/20"
                    required
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  Sube tu certificado de alumno regular en formato PDF para verificar tu condición de estudiante
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-sage hover:bg-sage/90 text-white py-3 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Crear Cuenta de Estudiante"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-neutral-600">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-sage hover:text-sage/80 font-semibold">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Options */}
        <div className="mt-6 text-center">
          <Link href="/register" className="text-neutral-600 hover:text-sage text-sm">
            ← Volver a selección de tipo
          </Link>
        </div>
      </div>
    </div>
  )
}