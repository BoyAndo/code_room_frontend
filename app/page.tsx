import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Users, Shield, Star, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ImageCarousel from "@/components/ui/image-carousel";

export default function LandingPage() {
  return (
    <div className="min-h-screen code-room-subtle-pattern">
      {/* Header */}
      <header className="bg-white border-b border-sage/15 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-golden to-education rounded-xl flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-sage">URoom</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-sage/30 text-sage hover:bg-warm bg-transparent"
                >
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-golden hover:bg-education text-white">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-800 leading-tight">
                  Encuentra arriendo <span className="text-sage">seguro</span>{" "}
                  para estudiantes universitarios
                </h1>
                <p className="text-lg md:text-xl text-neutral-600 leading-relaxed">
                  Conectamos estudiantes con propietarios verificados para
                  encontrar el hogar perfecto cerca de tu universidad
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-golden hover:bg-education text-white px-8 py-4 text-lg font-semibold shadow-lg w-full sm:w-auto"
                  >
                    Comenzar Ahora
                  </Button>
                </Link>
                <Link href="/search">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-sage/30 text-sage hover:bg-warm px-8 py-4 text-lg bg-white w-full sm:w-auto"
                  >
                    Explorar Propiedades
                  </Button>
                </Link>
              </div>

              {/* Stats inline */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-sage mb-1">
                    2,500+
                  </div>
                  <div className="text-sm text-neutral-600">Propiedades</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-sage mb-1">
                    15,000+
                  </div>
                  <div className="text-sm text-neutral-600">Estudiantes</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-sage mb-1">
                    4.9★
                  </div>
                  <div className="text-sm text-neutral-600">Calificación</div>
                </div>
              </div>
            </div>

            {/* Right Column - Image Carousel */}
            <div className="relative order-first lg:order-last">
              <div className="relative">
                <ImageCarousel
                  images={[
                    {
                      src: "/casas/casa-1.jpg",
                      alt: "Casa moderna para estudiantes - Exterior",
                      width: 600,
                      height: 600,
                    },
                    {
                      src: "/casas/casa-2.png",
                      alt: "Apartamento estudiantil - Vista frontal",
                      width: 600,
                      height: 600,
                    },
                    {
                      src: "/casas/casa-3.jpg",
                      alt: "Residencia universitaria - Ambiente acogedor",
                      width: 600,
                      height: 600,
                    },
                  ]}
                  autoSlide={true}
                  autoSlideInterval={3500}
                  showDots={true}
                  showArrows={true}
                  className="relative"
                  imageClassName="rounded-2xl shadow-2xl w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
                />
                {/* Floating card overlay */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-xs z-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-golden rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sage">100% Verificado</p>
                      <p className="text-sm text-neutral-600">
                        Propietarios confiables
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-800 mb-16">
            ¿Por qué elegir Code Room?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white backdrop-blur-sm border-sage/15 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-golden/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-sage" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  100% Verificado
                </h3>
                <p className="text-neutral-600">
                  Todos los propietarios y propiedades son verificados por
                  nuestro equipo
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-sage/15 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-warm rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-sage" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  Comunidad Estudiantil
                </h3>
                <p className="text-neutral-600">
                  Conecta con miles de estudiantes en toda Chile
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-sage/15 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-golden/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-sage" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  Respuesta Rápida
                </h3>
                <p className="text-neutral-600">
                  Respuestas en menos de 24 horas garantizadas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white backdrop-blur-sm border-sage/15 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-warm rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-sage" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  Sin Comisiones
                </h3>
                <p className="text-neutral-600">
                  Encuentra tu hogar ideal sin costos adicionales
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sage">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para encontrar tu hogar ideal?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Únete a miles de estudiantes que ya encontraron su lugar perfecto
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-golden hover:bg-education text-white px-8 py-4 text-lg font-semibold shadow-lg"
            >
              Comenzar Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold">URoom</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="#" className="hover:text-sage transition-colors">
                Ayuda
              </Link>
              <Link href="#" className="hover:text-sage transition-colors">
                Términos
              </Link>
              <Link href="#" className="hover:text-sage transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="hover:text-sage transition-colors">
                Contacto
              </Link>
            </div>
          </div>
          <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2025 URoom. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
