"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Home,
  Plus,
  Building2,
  LogOut,
  User,
  MessageSquareText, // 💡 Nuevo ícono para Chat
} from "lucide-react";
import { memo } from "react";

// 💡 Interfaz actualizada para incluir el contador de mensajes no leídos
interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  unreadMessagesCount: number; // 💡 Nuevo prop para el contador de notificaciones
}

export const Sidebar = memo(function Sidebar({
  currentView,
  onViewChange,
  onLogout,
  unreadMessagesCount, // 💡 Desestructurar el nuevo prop
}: SidebarProps) {
  // 💡 Definición de los ítems de navegación con el nuevo de Mensajes
  const navItems = [
    {
      name: "Dashboard",
      view: "dashboard",
      icon: TrendingUp,
      badge: 0,
    },
    {
      name: "Mis Propiedades",
      view: "properties",
      icon: Building2,
      badge: 0,
    },
    {
      name: "Nueva Propiedad",
      view: "create-property",
      icon: Plus,
      badge: 0,
    },
    // 💡 Nuevo ítem de navegación para Chat/Mensajes
    {
      name: "Mensajes",
      view: "chat",
      icon: MessageSquareText,
      badge: unreadMessagesCount, // Usar el contador de mensajes no leídos
    },
    {
      name: "Mi Perfil",
      view: "profile",
      icon: User,
      badge: 0,
    },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-neutral-200 z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-200">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-golden to-education rounded-lg flex items-center justify-center">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-neutral-800">URoom</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Mapeo de ítems de navegación, incluyendo el nuevo de Mensajes */}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === item.view
                    ? "bg-sage/10 text-sage"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}

                {/* 💡 Lógica del Badge de Notificación */}
                {item.badge > 0 && (
                  <span className="ml-auto bg-golden text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 space-y-2">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
});
