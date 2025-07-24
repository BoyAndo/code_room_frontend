import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Users, Shield, Star, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream/20">
      {/* Header */}
      <header className="bg-white border-b border-sage/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sage to-sage/70 rounded-xl flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-neutral-800">Code Room</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="border-sage/30 text-sage hover:bg-sage/10 bg-transparent">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-sage hover:bg-sage/90 text-white">Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-800 mb-6 leading-tight">
            Encuentra arriendo seguro para <span className="text-sage">estudiantes universitarios</span> en Chile
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
            Conectamos estudiantes con propietarios verificados para encontrar el hogar perfecto cerca de tu universidad
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button size="lg" className="bg-sage hover:bg-sage/90 text-white px-8 py-4 text-lg">
                Comenzar Ahora
              </Button>
            </Link>
            <Link href="/search">
              <Button
                size="lg"
                variant="outline"
                className="border-sage/30 text-sage hover:bg-sage/10 px-8 py-4 text-lg bg-transparent"
              >
                Explorar Propiedades
              </Button>
            </Link>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-4xl mx-auto">
            <Image
              src="/placeholder.svg?height=400&width=800"
              alt="Estudiantes universitarios buscando arriendo"
              width={800}
              height={400}
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-cream/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-sage mb-2">2,500+</div>
              <div className="text-neutral-600">Propiedades Verificadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-sage mb-2">15,000+</div>
              <div className="text-neutral-600">Estudiantes Registrados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-sage mb-2">50+</div>
              <div className="text-neutral-600">Ciudades</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-sage mb-2">4.9★</div>
              <div className="text-neutral-600">Calificación Promedio</div>
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
            <Card className="bg-white/90 backdrop-blur-sm border-sage/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-sage/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-sage" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">100% Verificado</h3>
                <p className="text-neutral-600">
                  Todos los propietarios y propiedades son verificados por nuestro equipo
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-sage/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-cream/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-sage" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Comunidad Estudiantil</h3>
                <p className="text-neutral-600">Conecta con miles de estudiantes en toda Chile</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-sage/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-sage/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-sage" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Respuesta Rápida</h3>
                <p className="text-neutral-600">Respuestas en menos de 24 horas garantizadas</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-sage/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-cream/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-sage" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Sin Comisiones</h3>
                <p className="text-neutral-600">Encuentra tu hogar ideal sin costos adicionales</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sage to-cream/60">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">¿Listo para encontrar tu hogar ideal?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Únete a miles de estudiantes que ya encontraron su lugar perfecto
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-sage hover:bg-white/90 px-8 py-4 text-lg font-semibold">
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
              <span className="text-xl font-bold">Code Room</span>
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
            <p>&copy; 2024 Code Room. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
