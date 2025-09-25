import api from "./api";

export type AssetStatus = "online" | "offline" | "doNotTrack";

export type AssetCriticality = "high" | "medium" | "low";

export interface Asset {
  id : string;
  organizationId: string;
  name : string;
  description?: string; 
  status?: AssetStatus;
  pictures : String[];
  files : String[]
  locationId?: string;
  criticality?: AssetCriticality;
  year?: number;
  warrantyDate? : Date;
  isUnderWarranty?: Boolean;
  isUnderAMC?: Boolean;
  manufacturer?: string;
  model?: string;
  serialNumber?: number;
  teamsInCharge ?: string[];
  qrCode ?: string;
  assetTypeId?: string;
  vendorId?: string;
  partIds?: string;
  parentAssetId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// For API responses
export type AssetResponse = Asset;

// For creating new assets
export interface CreateAssetData {
  organizationId: string;
  name : string;
  description?: string; 
  status?: AssetStatus;
  pictures : String[];
  files : String[]
  locationId?: string;
  criticality?: AssetCriticality;
  year?: number;
  warrantyDate? : Date;
  isUnderWarranty?: Boolean;
  isUnderAMC?: Boolean;
  manufacturer?: string;
  model?: string;
  serialNumber?: number;
  teamsInCharge ?: string[];
  qrCode ?: string;
  assetTypeId?: string;
  vendorId?: string;
  partIds?: string;
  parentAssetId?: string;
}

// For updating existing assets
export interface UpdateAssetData {
  organizationId: string;
  name : string;
  description?: string; 
  status?: AssetStatus;
  pictures : String[];
  files : String[]
  locationId?: string;
  criticality?: AssetCriticality;
  year?: number;
  warrantyDate? : Date;
  isUnderWarranty?: Boolean;
  isUnderAMC?: Boolean;
  manufacturer?: string;
  model?: string;
  serialNumber?: number;
  teamsInCharge ?: string[];
  qrCode ?: string;
  assetTypeId?: string;
  vendorId?: string;
  partIds?: string;
  parentAssetId?: string;
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
