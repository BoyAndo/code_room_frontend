"use client";

import { memo } from "react";
import {
  Loader2,
  Upload,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentRegistrationLoaderProps {
  status: "loading" | "success" | "error";
  errorMessages?: string[];
  onClose?: () => void;
}

export const StudentRegistrationLoader = memo(
  function StudentRegistrationLoader({
    status,
    errorMessages = [],
    onClose,
  }: StudentRegistrationLoaderProps) {
    const isLoading = status === "loading";
    const isSuccess = status === "success";
    const isError = status === "error";

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
          {/* Título */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="relative">
                {isLoading && (
                  <>
                    <div className="w-16 h-16 bg-golden/10 rounded-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-golden animate-spin" />
                    </div>
                    <div className="absolute inset-0 bg-golden/20 rounded-full animate-ping" />
                  </>
                )}
                {isSuccess && (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                )}
                {isError && (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isLoading && "Creando tu cuenta"}
              {isSuccess && "¡Cuenta creada!"}
              {isError && "Error en el registro"}
            </h2>
            <p className="text-sm text-gray-500">
              {isLoading &&
                "Por favor espera mientras validamos tu información"}
              {isSuccess &&
                "Tu cuenta de estudiante ha sido creada exitosamente."}
              {isError && "No se pudo completar la validación"}
            </p>
          </div>

          {/* Contenido según el estado */}
          {isLoading && (
            <>
              {/* Pasos del proceso */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Analizando tus datos de estudiante
                    </p>
                    <p className="text-xs text-gray-500">
                      Verificando nombre, RUT y email
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5 text-purple-600 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Subiendo certificado
                    </p>
                    <p className="text-xs text-gray-500">
                      Procesando documento de alumno regular
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-golden/20 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-golden animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Validando certificado estudiantil
                    </p>
                    <p className="text-xs text-gray-500">
                      Verificando tu condición de estudiante activo
                    </p>
                  </div>
                </div>
              </div>

              {/* Barra de progreso animada */}
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-golden to-education rounded-full animate-pulse-slow relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <p className="text-xs text-center text-gray-500">
                  Este proceso puede tomar unos segundos...
                </p>
              </div>
            </>
          )}

          {isSuccess && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ¡Bienvenido a URoom! Tu cuenta ha sido verificada y ya puedes
                  comenzar a buscar tu lugar ideal para vivir.
                </p>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Ir a mi perfil
              </Button>
            </div>
          )}

          {isError && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-red-900">
                      Se encontraron los siguientes problemas:
                    </p>
                    <ul className="space-y-2">
                      {errorMessages.map((error, index) => (
                        <li
                          key={index}
                          className="text-sm text-red-800 flex items-start space-x-2"
                        >
                          <span className="font-bold flex-shrink-0">
                            {index + 1}.
                          </span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  💡 <strong>Sugerencia:</strong> Verifica que tu certificado
                  de alumno regular sea válido, esté en formato PDF y sea
                  legible.
                </p>
              </div>
              <Button onClick={onClose} variant="destructive" className="w-full">
                Cerrar y corregir
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);
