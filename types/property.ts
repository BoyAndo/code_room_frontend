export interface Property {
  id: number;
  title: string;
  description: string;
  propertyType: string;
  monthlyRent: string | number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  availableFrom: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  regionId: number;
  comunaId: number;
  landlordId: number;
}

export interface Amenity {
  id: number;
  name: string;
  category: string;
}

export interface PropertyFormData {
  title: string;
  description: string;
  propertyType: string;
  monthlyRent: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  squareMeters: string;
  zipCode: string;
  regionName: string;
  comunaName: string;
  regionId: number;
  comunaId: number;
  rules: string;
  latitude: string;
  longitude: string;
  amenities: number[];
  utilityBill: File | null;
  propertyImages: File[];
}
