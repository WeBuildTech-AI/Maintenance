import axios from "axios";

import type {
  AssetResponse,
  CreateAssetData,
  UpdateAssetData,
} from "./assets.types";

const API_URL = import.meta.env.VITE_API_URL;

export const assetService = {
  fetchAssets: async (
    limit: number,
    page: number,
    offset: number
  ): Promise<AssetResponse[]> => {
    const res = await axios.get(`${API_URL}/assets`, {
      params: { limit, page, offset },
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  fetchAssetsName: async (): Promise<AssetResponse[]> => {
    const res = await axios.get(`${API_URL}/assets/summary`);
    return res.data;
  },

  fetchAssetById: async (id: string): Promise<AssetResponse> => {
    const res = await axios.get(`${API_URL}/assets/${id}`);
    return res.data;
  },

  createAsset: async (data: CreateAssetData): Promise<AssetResponse> => {
    const res = await axios.post(`${API_URL}/assets`, data);
    return res.data;
  },

  updateAsset: async (
    id: string,
    data: UpdateAssetData
  ): Promise<AssetResponse> => {
    const res = await axios.patch(`${API_URL}/assets/${id}`, data);
    return res.data;
  },

  deleteAsset: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/assets/${id}`);
  },
};
