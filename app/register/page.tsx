"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, GraduationCap, Building2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-cream/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-golden to-education rounded-xl flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-neutral-800">
              Code Room
            </span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
            ¿Cómo quieres registrarte?
          </h1>
          <p className="text-lg text-neutral-600">
            Elige el tipo de cuenta que mejor se adapte a ti
          </p>
        </div>

        {/* User Type Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student Card */}
          <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Image
                  src="/images/student.png"
                  alt="Estudiante universitario"
                  width={200}
                  height={200}
                  className="mx-auto rounded-full"
                />
              </div>
              <div className="mb-6">
                <GraduationCap className="h-12 w-12 text-golden mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-neutral-800 mb-3">
                  Soy Estudiante
                </h2>
                <p className="text-neutral-600 mb-6">
                  Busco un lugar seguro y cómodo para vivir cerca de mi
                  universidad
                </p>
              </div>
              <Link href="/register/student" className="block">
                <Button className="w-full bg-golden hover:bg-education text-white py-4 text-lg font-semibold group-hover:bg-education transition-colors">
                  Registrarme como Estudiante
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Landlord Card */}
          <Card className="bg-white backdrop-blur-sm border-sage/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Image
                  src="/images/landlord.png"
                  alt="Arrendador propietario"
                  width={200}
                  height={200}
                  className="mx-auto rounded-full"
                />
              </div>
              <div className="mb-6">
                <Building2 className="h-12 w-12 text-golden mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-neutral-800 mb-3">
                  Soy Arrendador
                </h2>
                <p className="text-neutral-600 mb-6">
                  Tengo propiedades disponibles para estudiantes universitarios
                </p>
              </div>
              <Link href="/register/landlord" className="block">
                <Button className="w-full bg-golden hover:bg-education text-white py-4 text-lg font-semibold group-hover:bg-education transition-colors">
                  Registrarme como Arrendador
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Additional Options */}
        <div className="mt-12 text-center">
          <p className="text-neutral-600 mb-4">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-golden hover:text-education font-semibold"
            >
              Iniciar sesión
            </Link>
          </p>
          <Link href="/" className="text-neutral-600 hover:text-golden text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
