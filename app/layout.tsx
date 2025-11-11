import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
import { AuthGuard } from "@/components/ui/AuthGuard";

export const metadata: Metadata = {
  title: "URoom",
  description: "Plataforma para estudiantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 🔑 CORRECCIÓN: Agregar suppressHydrationWarning al <html> y <body>
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <GoogleMapsProvider>
            <AuthGuard>{children}</AuthGuard>
          </GoogleMapsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}