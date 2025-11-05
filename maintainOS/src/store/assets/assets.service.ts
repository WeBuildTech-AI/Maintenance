import axios from "axios";
import api from "../auth/auth.service";

import type {
  AssetResponse,
  CreateAssetData,
  UpdateAssetData,
  UpdateAssetStatus,
} from "./assets.types";

const API_URL = import.meta.env.VITE_API_URL;

export const assetService = {
  fetchAssets: async (
    limit: number,
    page: number,
    offset: number
  ): Promise<AssetResponse[]> => {
    const res = await api.get(`/assets`, {
      params: { limit, page, offset },
      headers: { Accept: "application/json" },
    });
    return res.data;
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
};
