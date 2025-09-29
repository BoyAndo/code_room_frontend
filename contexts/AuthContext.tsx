"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
  profilePhotoUrl?: string;
  role: string;
}

type User = Student | Landlord;

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: () => void | Promise<void>;
  logout: () => void | Promise<void>;
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Al cargar la app, obtener el usuario autenticado desde el backend
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
        });

        // ✅ Verificar si la respuesta es exitosa (200-299)
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          // 401/403 es normal cuando no hay sesión activa
          setUser(null);
        }
      } catch (error) {
        // Error de red u otro error
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Actualiza el usuario desde el backend tras login exitoso
  const login = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  };

  const logout = async () => {
    // Puedes agregar un endpoint /auth/logout en el backend para borrar la cookie
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
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
