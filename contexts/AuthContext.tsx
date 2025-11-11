"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Interfaces separadas para cada tipo de usuario
interface Student {
  id: string;
  studentRut: string;
  studentEmail: string;
  studentName: string;
  studentCollege: string;
  studentCertificateUrl: string;
  profilePhotoUrl?: string;
  role: string;
}

interface Landlord {
  id: string;
  landlordRut: string;
  landlordEmail: string;
  landlordName: string;
  landlordCarnetUrl: string;
  landlordDocumentUrl?: string;
  phone?: string;
  profilePhotoUrl?: string;
  role: string;
}

type User = Student | Landlord;

interface AuthContextType {
  user: User | null;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log("Verificando autenticación...");
      // 🔑 IMPORTANTE: skipRefresh para evitar loops infinitos en /login
      const res = await apiFetch(`${API_BASE_URL}/auth/me`, {
        skipRefresh: true // No intentar refrescar automáticamente aquí
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Datos del usuario:", data);
        
        if (data.success && data.user) {
          setUser(data.user);
          return true;
        }
      }
      
      // Si no está autenticado, limpiar el usuario
      console.log("No hay sesión válida");
      setUser(null);
      return false;
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      const success = await checkAuth();
      if (success) {
        console.log("Login exitoso");
        return true;
      }
      console.log("Login fallido");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log("Cerrando sesión...");
      
      // Primero limpiar el estado local inmediatamente
      setUser(null);
      
      // Luego llamar al backend con skipRefresh para evitar loops
      await apiFetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        skipRefresh: true // No intentar refrescar durante el logout
      });
      
      console.log("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error en logout:", error);
      // Asegurarse de limpiar el estado incluso si falla la llamada al backend
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Funciones helper para verificar el tipo de usuario
export const isStudent = (user: User | null | undefined): user is Student => {
  return !!user && (user as Student).studentRut !== undefined;
};

export const isLandlord = (user: User | null | undefined): user is Landlord => {
  return !!user && (user as Landlord).landlordRut !== undefined;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
