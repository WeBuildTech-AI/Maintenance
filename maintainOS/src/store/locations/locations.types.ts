import type { BUD } from "../../components/utils/BlobUpload";

export interface LocationResponse {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  createdAt: string;
  updatedAt: string;
  qrCode: string;
  parentLocationId: string;
  children: LocationResponse[];
  locationImages?: BUD[]; 
  locationDocs?: BUD[]; 
  teamsInCharge: string[];
  vendorIds: string[];
  // Keep old fields for backward compatibility during transition
  photoUrls?: BUD[];
  files?: BUD[];
}

export interface CreateLocationData {
  organizationId: string;
  name: string;
  createdBy: string; 
  description?: string;
  address?: string;
  qrCode?: string; 
  locationImages?: BUD[]; 
  locationDocs?: BUD[]; 
  teamsInCharge: string[];
  vendorIds: string[];
  parentLocationId?: string; 
}

export interface fetchLocationData {
  limit: number;
  page: number;
  offset: number;
}

export interface UpdateLocationData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface LocationsState {
  locations: LocationResponse[];
  selectedLocation: LocationResponse | null;
  loading: boolean;
  error: string | null;
}
