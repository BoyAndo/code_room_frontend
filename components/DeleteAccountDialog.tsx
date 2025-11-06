"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userType: "student" | "landlord";
  isDeleting?: boolean;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirm,
  userType,
  isDeleting = false,
}: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmValid = confirmText === "ACEPTO";

  const handleConfirm = () => {
    if (isConfirmValid) {
      onConfirm();
      setConfirmText(""); // Reset después de confirmar
    }
  };

  const handleCancel = () => {
    setConfirmText("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              ¿Eliminar cuenta permanentemente?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Esta acción no se puede deshacer y eliminará permanentemente todos tus datos.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
            <p className="text-sm text-red-800 font-medium">
              Se eliminará permanentemente:
            </p>
            <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
              <li>Tu perfil de {userType === "student" ? "estudiante" : "propietario"}</li>
              <li>Toda tu información personal</li>
              {userType === "landlord" && (
                <li className="font-semibold">Todas tus propiedades publicadas</li>
              )}
              <li>Tus documentos subidos</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-neutral-700">
              Para confirmar, escribe <span className="font-bold text-red-600">ACEPTO</span> a continuación:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe ACEPTO"
              className="border-red-300 focus:border-red-500 focus:ring-red-500"
              disabled={isDeleting}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isDeleting ? "Eliminando..." : "Eliminar cuenta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
