import api from "./api";
import type { Part } from "@prisma/client";

// Re-export Prisma types for convenience
export type { Part } from "@prisma/client";

// For API responses
export type PartResponse = Part;

// For creating new parts
export interface CreatePartData {
  organizationId: string;
  name: string;
  partNumber?: string;
  description?: string;
  manufacturer?: string;
  unitCost?: number;
  category?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  leadTime?: number;
  specifications?: any; // JSON object
}

// For updating existing parts
export interface UpdatePartData {
  name?: string;
  partNumber?: string;
  description?: string;
  manufacturer?: string;
  unitCost?: number;
  category?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  leadTime?: number;
  specifications?: any; // JSON object
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
