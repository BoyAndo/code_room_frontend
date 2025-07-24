"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Home, Mail, Lock, User, FileText, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState<"student" | "landlord">("student")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    document: null as File | null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle registration logic here
    console.log("Registration attempt:", { ...formData, userType })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData({ ...formData, document: file })
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
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Crear Cuenta</h1>
          <p className="text-neutral-600">Únete a nuestra comunidad</p>
        </div>

        {/* Registration Form */}
        <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-neutral-800">Registro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label className="text-neutral-700">Tipo de usuario</Label>
                <RadioGroup
                  value={userType}
                  onValueChange={(value) => setUserType(value as "student" | "landlord")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="cursor-pointer">
                      Estudiante
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="landlord" id="landlord" />
                    <Label htmlFor="landlord" className="cursor-pointer">
                      Arrendador
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-neutral-700">
                  Nombre completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-700">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
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

              {/* Document Upload */}
              <div className="space-y-2">
                <Label htmlFor="document" className="text-neutral-700">
                  {userType === "student"
                    ? "Certificado de alumno regular (.pdf)"
                    : "Certificado de dominio vigente (.pdf)"}
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="document"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sage/10 file:text-sage hover:file:bg-sage/20"
                    required
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  {userType === "student"
                    ? "Sube tu certificado de alumno regular para verificar tu condición de estudiante"
                    : "Sube tu certificado de dominio para verificar la propiedad"}
                </p>
              </div>

              <Button type="submit" className="w-full bg-sage hover:bg-sage/90 text-white py-3 text-lg font-semibold">
                Registrarme
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
          <Link href="/" className="text-neutral-600 hover:text-sage text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
