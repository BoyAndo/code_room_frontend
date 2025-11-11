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
      if (pathname === "/login" || pathname === "/register") {
        // Solo redirigir si tenemos un usuario válido
        if (isLandlord(user)) {
          console.log("Redirigiendo landlord a su perfil");
          router.push("/profile/landlord");
        } else {
          console.log("Redirigiendo estudiante a búsqueda");
          router.push("/search");
        }
      } else if (pathname === "/") {
        // Desde la página principal, redirigir según el tipo de usuario
        if (isLandlord(user)) {
          console.log("Redirigiendo landlord desde home a su perfil");
          router.push("/profile/landlord");
        } else {
          console.log("Redirigiendo estudiante desde home a búsqueda");
          router.push("/search");
        }
      } else if (isLandlord(user) && pathname === "/search") {
        console.log("Landlord intentando acceder a /search");
        router.push("/profile/landlord");
      }
    } else {
      // Redirecciones para usuarios no autenticados
      const protectedRoutes = ["/profile", "/profile/landlord", "/property"];
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      
      // Solo redirigir a login si estamos en una ruta protegida y NO estamos ya en login o register
      if (isProtectedRoute && pathname !== "/login" && pathname !== "/register") {
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