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
      className="bg-white border border-neutral-200 rounded-lg overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-neutral-800 mb-1">
              {property.title}
            </h3>
            {/* 🔑 USAR LA UBICACIÓN COMPLETA */}
            <p className="text-sm text-neutral-600 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {/* ✅ CORRECCIÓN: Mostrar ubicación completa */}
              {property.address}
              {property.comunaName ? `, ${property.comunaName}` : ""}
              {property.regionName ? `, ${property.regionName}` : ""}
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
