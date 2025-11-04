"use client";

import { Property } from "@/types/property";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  BedDouble,
  Bath,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Building2,
} from "lucide-react";
import { memo } from "react";
import { useRouter } from "next/navigation";

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: () => void;
}

export const PropertyCard = memo(function PropertyCard({
  property,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  const { address, comunaName, regionName } = property;
  const router = useRouter();

  // Formatear la ubicación completa
  const fullLocation = `${address}, ${comunaName || "Comuna"}, ${
    regionName || "Región"
  }`;
  return (
    <div
      key={property.id}
      className="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* Miniatura de la propiedad */}
      <div className="relative h-48 bg-neutral-100 overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-16 w-16 text-neutral-300" />
          </div>
        )}
        {/* Badge de disponibilidad */}
        {property.isAvailable && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Disponible
          </div>
        )}
        {/* Contador de imágenes */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {property.images.length} fotos
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-800 mb-1 line-clamp-1">
              {property.title}
            </h3>
            {/* 🔑 USAR LA UBICACIÓN COMPLETA */}
            <p className="text-sm text-neutral-600 flex items-start">
              <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">
                {/* ✅ CORRECCIÓN: Mostrar ubicación completa */}
                {property.address}
                {property.comunaName ? `, ${property.comunaName}` : ""}
                {property.regionName ? `, ${property.regionName}` : ""}
              </span>
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/property/${property.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(property)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-4">
          <span className="flex items-center">
            <BedDouble className="h-4 w-4 mr-1" />
            {property.bedrooms} dormitorios
          </span>
          <span className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            {property.bathrooms} baños
          </span>
        </div>

        <p className="text-lg font-semibold text-sage">
          $
          {parseFloat(property.monthlyRent?.toString() || "0").toLocaleString()}
          /mes
        </p>
      </div>
    </div>
  );
});
