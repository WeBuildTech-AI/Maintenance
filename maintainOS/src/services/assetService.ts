import api from "./api";
import type { Asset, AssetStatus, AssetCriticality } from "@prisma/client";

// Re-export Prisma types for convenience
export type { Asset, AssetStatus, AssetCriticality } from "@prisma/client";

// For API responses
export type AssetResponse = Asset;

// For creating new assets
export interface CreateAssetData {
  organizationId: string;
  locationId?: string;
  categoryId?: string;
  name: string;
  description?: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiration?: string;
  status?: AssetStatus;
  criticality?: AssetCriticality;
  installationDate?: string;
  expectedLifespan?: number;
  currentValue?: number;
  maintenanceNotes?: string;
}

// For updating existing assets
export interface UpdateAssetData {
  locationId?: string;
  categoryId?: string;
  name?: string;
  description?: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiration?: string;
  status?: AssetStatus;
  criticality?: AssetCriticality;
  installationDate?: string;
  expectedLifespan?: number;
  currentValue?: number;
  maintenanceNotes?: string;
}

export const assetService = {
  // Fetch all assets
  fetchAssets: async (): Promise<AssetResponse[]> => {
    const response = await api.get("/assets");
    return response.data;
  },

  // Fetch asset by ID
  fetchAssetById: async (id: string): Promise<AssetResponse> => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  // Create a new asset
  createAsset: async (assetData: CreateAssetData): Promise<AssetResponse> => {
    const response = await api.post("/assets", assetData);
    return response.data;
  },

  // Update asset
  updateAsset: async (
    id: string,
    assetData: UpdateAssetData
  ): Promise<AssetResponse> => {
    const response = await api.patch(`/assets/${id}`, assetData);
    return response.data;
  },

  // Delete asset
  deleteAsset: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
  },
};
