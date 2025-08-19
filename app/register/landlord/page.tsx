"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Home, Mail, Lock, User, FileText, Eye, EyeOff, Building2 } from "lucide-react"
import Link from "next/link"

export default function LandlordRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    landlordName: "",
    landlordRut: "",
    landlordEmail: "",
    password: "",
    landlordCarnet: null as File | null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Landlord registration:", formData)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData({ ...formData, landlordCarnet: file })
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
            <Building2 className="h-8 w-8 text-sage" />
            <h1 className="text-2xl font-bold text-neutral-800">Registro de Arrendador</h1>
          </div>
          <p className="text-neutral-600">Completa tus datos para crear tu cuenta</p>
        </div>

        {/* Registration Form */}
        <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-neutral-800">Información del Arrendador</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Landlord Name */}
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
                    onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                </div>
              </div>

              {/* Landlord RUT */}
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
                    onChange={(e) => setFormData({ ...formData, landlordRut: e.target.value })}
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20"
                    required
                  />
                </div>
              </div>

              {/* Landlord Email */}
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
                    onChange={(e) => setFormData({ ...formData, landlordEmail: e.target.value })}
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

              {/* Landlord Carnet */}
              <div className="space-y-2">
                <Label htmlFor="landlordCarnet" className="text-neutral-700">
                  Carnet de identidad
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="landlordCarnet"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="pl-10 border-sage/30 focus:border-sage focus:ring-sage/20 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sage/10 file:text-sage hover:file:bg-sage/20"
                    required
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  Sube una foto de tu carnet de identidad para verificar tu identidad
                </p>
              </div>

              <Button type="submit" className="w-full bg-sage hover:bg-sage/90 text-white py-3 text-lg font-semibold">
                Crear Cuenta de Arrendador
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
