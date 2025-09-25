import api from "./api";

export interface Part {
  id: string;
  organizationId: string;
  name: string;
  photos: string[];
  unitCost?: Float32Array;
  description?: string;
  qrCode?: string;
  partsType: string[];
  location?: any;
  assetIds: string[];
  teamsInCharge: string[];
  vendorIds: string[];
  files: string[];
  createdAt: Date;
  updatedAt: Date;
}
// For API responses
export type PartResponse = Part;

// For creating new parts
export interface CreatePartData {
  organizationId: string;
  name: string;
  photos: string[];
  unitCost?: Float32Array;
  description?: string;
  qrCode?: string;
  partsType: string[];
  location?: any;
  assetIds: string[];
  teamsInCharge: string[];
  vendorIds: string[];
  files: string[];
}

// For updating existing parts
export interface UpdatePartData {
  organizationId: string;
  name: string;
  photos: string[];
  unitCost?: Float32Array;
  description?: string;
  qrCode?: string;
  partsType: string[];
  location?: any;
  assetIds: string[];
  teamsInCharge: string[];
  vendorIds: string[];
  files: string[];
}

export const partService = {
  // Fetch all parts
  fetchParts: async (): Promise<PartResponse[]> => {
    const response = await api.get("/parts");
    return response.data;
  },

  // Fetch part by ID
  fetchPartById: async (id: string): Promise<PartResponse> => {
    const response = await api.get(`/parts/${id}`);
    return response.data;
  },

  // Create a new part
  createPart: async (partData: CreatePartData): Promise<PartResponse> => {
    const response = await api.post("/parts", partData);
    return response.data;
  },

  // Update part
  updatePart: async (
    id: string,
    partData: UpdatePartData
  ): Promise<PartResponse> => {
    const response = await api.patch(`/parts/${id}`, partData);
    return response.data;
  },

  // Delete part
  deletePart: async (id: string): Promise<void> => {
    await api.delete(`/parts/${id}`);
  },
};
