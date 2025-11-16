// components/chats/StudentConversationListItem.tsx
import { MessageSquare, Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

// Interfaz de datos que recibe el componente, con nombres ya resueltos
interface ChatListItem {
  conversationId: string;
  landlordId: string;
  propertyId: string;
  lastMessageContent: string;
  lastMessageTime: string;
  landlordName: string; // Nombre del propietario (resuelto)
  propertyName: string; // Nombre o título de la propiedad (resuelto)
}

interface StudentConversationListItemProps {
  chat: ChatListItem;
}

const StudentConversationListItem: React.FC<StudentConversationListItemProps> = ({ chat }) => {

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    // Comprobar si es hoy
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    }
    // Comprobar si fue ayer
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    }
    
    // Si no es hoy ni ayer, mostrar fecha corta
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
    });
  };

  return (
    <Link 
      // Redirige al chat individual usando el ID canónico
      href={`/student/chats/${chat.conversationId}`} 
      className="flex items-start p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-150 cursor-pointer hover:border-sage-500"
    >
      <div className="flex-shrink-0 mr-4 mt-1">
        <MessageSquare className="h-6 w-6 text-sage-600" />
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-semibold text-neutral-800 truncate">
            {chat.landlordName} (Propietario)
          </h3>
          <span className="text-xs text-neutral-500 flex-shrink-0">
            {formatDate(chat.lastMessageTime)}
          </span>
        </div>
        
        <p className="text-sm text-neutral-600 truncate flex items-center mb-1">
          <Home className="h-4 w-4 mr-1 text-golden-500" />
          Propiedad: **{chat.propertyName}**
        </p>

        <p className="text-sm text-gray-500 truncate">
          Último mensaje: {chat.lastMessageContent || "*Nueva conversación iniciada*"}
        </p>
      </div>

      <div className="flex-shrink-0 ml-4 pt-3">
          <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Link>
  );
};

export default StudentConversationListItem;