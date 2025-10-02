export interface Property {
  id: number;
  title: string;
  description: string;
  propertyType: string;
  monthlyRent: string | number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  squareMeters?: number;
  regionId: number;
  comunaId: number;
  region?: string;
  comuna?: string;
  availableFrom: string;
  isAvailable: boolean;
  utilityBillUrl?: string;
  utilityBillValidated?: boolean;
  images?: string[];
  amenities?: Amenity[];
  createdAt: string;
  updatedAt: string;
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
  regionName: string;
  comunaName: string;
  regionId: number;
  comunaId: number;
  amenities: number[];
  utilityBill: File | null;
  propertyImages: File[];
}
