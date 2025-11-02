"use client";

import { useEffect } from "react";
import { useAuth, isLandlord } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    console.log("AuthGuard - Estado actual:", {
      isAuthenticated,
      pathname,
      userType: user ? (isLandlord(user) ? "landlord" : "student") : "none"
    });

    if (isAuthenticated && user) {
      // Redirecciones para usuarios autenticados
      if (pathname === "/" || pathname === "/login" || pathname === "/register") {
        if (isLandlord(user)) {
          console.log("Redirigiendo landlord a su perfil");
          router.push("/profile/landlord");
        } else {
          console.log("Redirigiendo estudiante a búsqueda");
          router.push("/search");
        }
      } else if (isLandlord(user) && pathname === "/search") {
        console.log("Landlord intentando acceder a /search");
        router.push("/profile/landlord");
      }
    } else {
      // Redirecciones para usuarios no autenticados
      const protectedRoutes = ["/profile", "/profile/landlord", "/property"];
      if (protectedRoutes.some(route => pathname.startsWith(route))) {
        console.log("Usuario no autenticado intentando acceder a ruta protegida");
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);

  if (isLoading) {
    console.log("AuthGuard - Cargando...");
    return (
      <div className="min-h-screen bg-cream/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto mb-4"></div>
          <p className="text-neutral-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}