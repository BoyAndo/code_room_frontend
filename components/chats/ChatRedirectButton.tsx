// components/chats/ChatRedirectButton.tsx
"use client";

import { Button } from "@/components/ui/button"; // Asume tu componente Button
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface ChatRedirectButtonProps {
  propertyId: string;
  landlordId: string;
  currentUserId: string; // ID del estudiante logueado
}

const ChatRedirectButton: React.FC<ChatRedirectButtonProps> = ({
  propertyId,
  landlordId,
  currentUserId,
}) => {
  const router = useRouter();

  const handleRedirect = () => {
    // 1. Generar el ID de conversación canónico (igual en ambos lados)
    // Se ordenan los IDs de usuario para que el conversationId sea siempre el mismo
    const participants = [landlordId, currentUserId].sort();
    const conversationId = `${propertyId}-${participants[0]}-${participants[1]}`;

    // 2. Redirigir a la nueva página de chat
    router.push(`/student/chats/${conversationId}`);
  };

  return (
    <Button
      onClick={handleRedirect}
      className="bg-golden hover:bg-education text-white w-full sm:w-auto"
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Chatear con Propietario
    </Button>
  );
};

export default ChatRedirectButton;