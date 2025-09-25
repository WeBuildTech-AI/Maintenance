import api from "./api";

// Type definitions 
export interface Location {
  id : string;
  organizationId : string;
  name: string;
  photoUrls : string[];
  address?: string;
  description?: string;
  teamsInCharge: string[];
  files: string[];
  vendorIds : string[];
  parentLocationId?: string;
  createdAt: Date;
  updatedAt : Date;
}

// For API responses
export type LocationResponse = Location;

// For creating new locations
export interface CreateLocationData {
  organizationId : string;
  name : string;
  photoUrls : string[];
  address?: string;
  description?: string;
  teamsInCharge: string[];
  files: string[];
  vendorIds : string[];
  parentLocationId?: string;
}

// For updating existing locations
export interface UpdateLocationData {
  organizationId : string;
  name : string;
  photoUrls : string[];
  address?: string;
  description?: string;
  teamsInCharge: string[];
  files: string[];
  vendorIds : string[];
  parentLocationId?: string;
}

export const locationService = {
  // Fetch all locations
  fetchLocations: async (): Promise<LocationResponse[]> => {
    const response = await api.get("/locations");
    return response.data;
  },

  // Fetch location by ID
  fetchLocationById: async (id: string): Promise<LocationResponse> => {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  },

  // Create a new location
  createLocation: async (
    locationData: CreateLocationData
  ): Promise<LocationResponse> => {
    const response = await api.post("/locations", locationData);
    return response.data;
  },

  // Update location
  updateLocation: async (
    id: string,
    locationData: UpdateLocationData
  ): Promise<LocationResponse> => {
    const response = await api.patch(`/locations/${id}`, locationData);
    return response.data;
  },

  // Delete location
  deleteLocation: async (id: string): Promise<void> => {
    await api.delete(`/locations/${id}`);
  },
};
