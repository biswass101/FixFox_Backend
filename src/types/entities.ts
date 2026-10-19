export interface Location {
  id: string;
  name: string;
  building?: string | null;
  floor?: string | null;
  room?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export type AssetCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'OUT_OF_SERVICE';

export interface Asset {
  id: string;
  locationId: string;
  assetCode: string;
  name: string;
  category: string;
  manufacturer?: string | null;
  modelNumber?: string | null;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  warrantyExpiresAt?: string | null;
  condition: AssetCondition;
  isActive: boolean;
  createdAt?: string;
  location?: Location;
}

export interface TechnicianSummary {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  skills: string[];
  activeJobCount: number;
}

