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
}

export interface CreateLocationData {
  organizationId: string;
  name: string;
  description?: string;
  address?: string;
  photoUrls: [];
  teamsInCharge: [];
  files: [];
  vendorIds: [];
  parentLocationId: string;
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
