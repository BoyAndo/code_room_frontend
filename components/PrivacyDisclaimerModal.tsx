"use client";

import { memo } from "react";
import { Shield, Lock, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PrivacyDisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  userType: "student" | "landlord";
}

export const PrivacyDisclaimerModal = memo(function PrivacyDisclaimerModal({
  isOpen,
  onAccept,
  onDecline,
  userType,
}: PrivacyDisclaimerModalProps) {
  const userTypeText = userType === "student" ? "estudiante" : "arrendador";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDecline()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-sage" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            Términos de Privacidad y Seguridad – URoom
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            Registro de {userTypeText}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contenido principal */}
          <div className="bg-gradient-to-br from-sage/5 to-golden/5 rounded-lg p-6 space-y-4 border border-sage/20">
            <p className="text-gray-700 leading-relaxed">
              En <span className="font-semibold text-sage">URoom</span>, la
              seguridad y la protección de los datos de nuestros usuarios
              constituyen nuestra <span className="font-semibold">máxima prioridad</span>.
              La información que recopilamos se utiliza exclusivamente para
              fines de autenticación, verificación de identidad y resguardo de
              la seguridad de cada cuenta.
            </p>

            <p className="text-gray-700 leading-relaxed">
              <span className="font-semibold">No empleamos datos personales</span> para
              ningún otro propósito distinto al funcionamiento seguro del
              servicio, ni los compartimos con terceros sin autorización expresa
              del usuario aceptando estos términos.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Nuestro compromiso es ofrecer una plataforma{" "}
              <span className="font-semibold">confiable, transparente y alineada</span> con
              las mejores prácticas de la industria. Trabajamos continuamente
              para mejorar nuestros estándares de seguridad, fortalecer nuestros
              sistemas y garantizar que cada usuario tenga el control total de
              su información.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Al utilizar URoom, aceptas nuestras políticas de privacidad y
              nuestro <span className="font-semibold">compromiso permanente</span> con un
              entorno seguro y responsable.
            </p>
          </div>

          {/* Características de seguridad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Datos Encriptados
              </h4>
              <p className="text-xs text-gray-600">
                Tu información está protegida con las mejores prácticas de seguridad.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Sin visualización externa
              </h4>
              <p className="text-xs text-gray-600">
                Nuestro entorno cerrado ofrece mayor seguridad.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Control Total
              </h4>
              <p className="text-xs text-gray-600">
                Administra tus datos completamente.
              </p>
            </div>
          </div>

          {/* Nota importante */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 mb-1">
                  Importante
                </p>
                <p className="text-xs text-amber-800">
                  Al continuar con el registro, confirmas que has leído y
                  aceptas nuestros términos de privacidad y seguridad. Puedes
                  revisar nuestra política completa en cualquier momento desde
                  tu perfil.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={onDecline}
            variant="outline"
            className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={onAccept}
            className="w-full sm:w-auto bg-sage hover:bg-sage-dark text-white"
          >
            Acepto los términos y continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
