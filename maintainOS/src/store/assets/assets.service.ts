import api from "../auth/auth.service";

import type {
  AssetResponse,
  CreateAssetData,
  UpdateAssetData,
  UpdateAssetStatus,
  FetchAssetsParams, // ✅ Imported
} from "./assets.types";


export const assetService = {
  // ✅ Updated to accept params object
  fetchAssets: async (
    params?: FetchAssetsParams
  ): Promise<AssetResponse[]> => {
    const res = await api.get(`/assets`, {
      params,
      // Ensure arrays are serialized correctly (e.g. statusOneOf=id1,id2)
      paramsSerializer: { indexes: null },
      headers: { Accept: "application/json" },
    });
    
    // Handle both potential response structures
    if (res.data && Array.isArray(res.data.items)) return res.data.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  fetchAssetsName: async (): Promise<AssetResponse[]> => {
    const res = await api.get(`/assets/summary`);
    return res.data;
  },

  fetchAssetById: async (id: string): Promise<AssetResponse> => {
    const res = await api.get(`/assets/${id}`);
    return res.data;
  },

  createAsset: async (data: CreateAssetData): Promise<AssetResponse> => {
    const res = await api.post(`/assets`, data);
    return res.data;
  },

  updateAsset: async (
    id: string,
    data: UpdateAssetData
  ): Promise<AssetResponse> => {
    const res = await api.patch(`/assets/${id}`, data);
    return res.data;
  },

  deleteAsset: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
  },

  fetchAssetType: async (): Promise<AssetResponse> => {
    const res = await api.get(`/assets/get/asset-type`);
    return res.data;
  },
  createAssetType: async (data: CreateAssetData): Promise<AssetResponse> => {
    const res = await api.post(`/assets/asset-type`, data);
    return res.data;
  },

  fetchAssetManufacturer: async (): Promise<AssetResponse> => {
    const res = await api.get(`/assets/get/manufacturer`);
    return res.data;
  },

  createAssetManufacture: async (
    data: CreateAssetData
  ): Promise<AssetResponse> => {
    const res = await api.post(`/assets/manufacturer`, data);
    return res.data;
  },

  updateAssetStatus: async (
    id: string,
    data: UpdateAssetStatus
  ): Promise<AssetResponse> => {
    const res = await api.patch(`/assets/${id}/status`, data);
    return res.data;
  },

  fetchAssetStatusLog: async (id: string): Promise<AssetResponse> => {
    const res = await api.get(`/assets/${id}/logs`);
    return res.data;
  },

  deleteAssetStatus: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}/status`);
  },

  batchDeleteAsset: async (ids: string[]): Promise<void> => {
    await api.delete(`assets/batch-delete`, {
      data: { ids: ids },
    });
  },

  fetchDeleteAsset: async (): Promise<void> => {
    const res = await api.get(`assets/deleted/all`);
    return res.data;
  },

  restoreAssetData: async (id: string): Promise<AssetResponse> => {
    const res = await api.patch(`/assets/${id}/restore`);
    return res.data;
  },
};