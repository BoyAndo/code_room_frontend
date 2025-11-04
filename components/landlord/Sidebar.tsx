"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Home,
  Plus,
  Building2,
  LogOut,
  ArrowLeft,
  User,
} from "lucide-react";
import { memo } from "react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export const Sidebar = memo(function Sidebar({
  currentView,
  onViewChange,
  onLogout,
}: SidebarProps) {
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
          <button
            onClick={() => onViewChange("dashboard")}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentView === "dashboard"
                ? "bg-sage/10 text-sage"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <TrendingUp className="mr-3 h-4 w-4" />
            Dashboard
          </button>

          <button
            onClick={() => onViewChange("properties")}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentView === "properties"
                ? "bg-sage/10 text-sage"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <Building2 className="mr-3 h-4 w-4" />
            Mis Propiedades
          </button>

          <button
            onClick={() => onViewChange("create-property")}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentView === "create-property"
                ? "bg-sage/10 text-sage"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <Plus className="mr-3 h-4 w-4" />
            Nueva Propiedad
          </button>

          <button
            onClick={() => onViewChange("profile")}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentView === "profile"
                ? "bg-sage/10 text-sage"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <User className="mr-3 h-4 w-4" />
            Mi Perfil
          </button>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 space-y-2">
          {/* Se removió el botón "Volver al inicio" */}
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
