import api from "../auth/auth.service";

import type {
  AssetResponse,
  CreateAssetData,
  UpdateAssetData,
  UpdateAssetStatus,
  FetchAssetsParams,
  AssetLogResponse,
} from "./assets.types";

export const assetService = {
  fetchAssets: async (
    params?: FetchAssetsParams & Record<string, any>
  ): Promise<AssetResponse[]> => {
    const apiParams: Record<string, any> = {};

    if (params) {
      if (params.page) apiParams.page = params.page;
      if (params.limit) apiParams.limit = params.limit;
      if (params.name) apiParams.name = params.name;

      const mappings: Record<string, string> = {
        status: "statusOneOf",
        criticality: "criticalityOneOf",
        location: "locationOneOf",
        manufacturer: "manufacturerOneOf",
        vendor: "vendorOneOf",
        part: "partOneOf",
        teamsInCharge: "teamsOneOf",
        assetTypes: "assetTypeOneOf",
        downtimeType: "downtimeTypeOneOf",
        downtimeReason: "downtimeReasonOneOf",
        description: "descriptionContains",
        serialNumber: "serialContains",
        year: "yearContains",
        workOrderRecurrence: "workOrderRecurrence",
        asset: "name", 
      };

      Object.keys(params).forEach((key) => {
        const apiKey = mappings[key] || key;
        if (['page', 'limit', 'name'].includes(apiKey) && mappings[key] === undefined) return;

        const value = params[key];
        if (value !== undefined && value !== null && value !== "") {
           if (Array.isArray(value)) {
             apiParams[apiKey] = value.join(',');
           } else {
             apiParams[apiKey] = String(value);
           }
        }
      });
    }

    const res = await api.get(`/assets`, {
      params: apiParams,
      headers: { Accept: "application/json" },
    });

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
    data: Partial<UpdateAssetData>
  ): Promise<AssetResponse> => {
    const res = await api.patch(`/assets/${id}`, data);
    return res.data;
  },

  deleteAsset: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
  },

  fetchDeleteAsset: async (): Promise<AssetResponse[]> => {
    const res = await api.get(`/assets/deleted/all`);
    return res.data;
  },

  restoreAssetData: async (id: string): Promise<AssetResponse> => {
    const res = await api.patch(`/assets/${id}/restore`);
    return res.data;
  },

  fetchAssetType: async (): Promise<AssetResponse[]> => {
    const res = await api.get(`/assets/get/asset-type`);
    return res.data;
  },
  createAssetType: async (data: any): Promise<AssetResponse> => {
    const res = await api.post(`/assets/asset-type`, data);
    return res.data;
  },

  fetchAssetManufacturer: async (): Promise<AssetResponse[]> => {
    const res = await api.get(`/assets/get/manufacturer`);
    return res.data;
  },

  createAssetManufacture: async (data: any): Promise<AssetResponse> => {
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

  // ✅ UPDATED with Debugging Logs
  fetchAssetStatusLog: async (id: string): Promise<AssetLogResponse> => {
    const res = await api.get(`/assets/${id}/logs`, {
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  deleteAssetStatus: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}/status`);
  },

  batchDeleteAsset: async (ids: string[]): Promise<void> => {
    await api.delete(`assets/batch-delete`, {
      data: { ids },
    });
  },

  updateAssetLogDuration: async (id: string): Promise<void> => {
    await api.patch(`/assets/${id}/logs/duration`);
  },
};