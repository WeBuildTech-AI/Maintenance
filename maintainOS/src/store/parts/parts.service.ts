// src/store/parts/parts.service.ts
import api from "../auth/auth.service";
import type {
  PartResponse,
  FetchPartsParams,
  CreatePartPayload,
  UpdatePartPayload,
  PartActivityLog,
  RestockThunkArgs,
  PartRestockLog
} from "./parts.types";

export const partService = {
  // ... (keep other methods like fetchParts, etc.)

  fetchParts: async (params?: FetchPartsParams): Promise<PartResponse[]> => {
    const res = await api.get(`/parts`, {
      params,
      paramsSerializer: { indexes: null },
      headers: { Accept: "application/json" },
    });
    if (res.data && Array.isArray(res.data.items)) return res.data.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  fetchPartById: async (id: string): Promise<PartResponse> => {
    const res = await api.get(`/parts/${id}`);
    return res.data;
  },

  createPart: async (data: CreatePartPayload): Promise<PartResponse> => {
    const res = await api.post(`/parts`, data);
    return res.data;
  },

  updatePart: async (id: string, data: UpdatePartPayload): Promise<PartResponse> => {
    const res = await api.patch(`/parts/${id}`, data);
    return res.data;
  },

  deletePart: async (id: string): Promise<void> => {
    await api.delete(`parts/batch-delete`, {
      data: { ids: [id] },
    });
  },

  fetchPartsName: async (): Promise<PartResponse[]> => {
    const res = await api.get(`/parts/summary`, {
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  restockPart: async (partId: string, payload: RestockThunkArgs): Promise<PartResponse> => {
    // 🆕 Transform payload to match "restockTargets" schema
    // Remove partId from body as it's in the URL
    const { partId: _, locationId, addedUnits, ...rest } = payload;

    const formattedPayload = {
      ...rest,
      restockTargets: [
        {
          locationId,
          addedUnits,
        },
      ],
    };

    const res = await api.post(`/parts/${partId}/restock`, formattedPayload);
    return res.data;
  },

  getAllRestockLogs: async (partId: string): Promise<PartRestockLog[]> => {
    const res = await api.get(`/parts/${partId}/restock-logs`);
    return res.data;
  },

  getRestockLogById: async (logId: string): Promise<PartRestockLog> => {
    const res = await api.get(`/parts/restock-logs/${logId}`);
    return res.data;
  },

  batchDeletePart: async (ids: string[]): Promise<void> => {
    await api.delete(`parts/batch-delete`, {
      data: { ids: ids },
    });
  },

  fetchDeletePart: async (): Promise<PartResponse[]> => {
    const res = await api.get(`parts/deleted/all`);
    return res.data;
  },

  restorePartData: async (id: string): Promise<PartResponse> => {
    const res = await api.patch(`/parts/${id}/restore`);
    return res.data;
  },

  // ✅ DEBUGGING ADDED HERE
  fetchPartLogs: async (id: string): Promise<PartActivityLog[]> => {
    console.log(`📡 Fetching logs for Part ID: ${id}`);
    const res = await api.get(`/parts/get/logs/${id}`);

    console.log("🔥 RAW API RESPONSE:", res);

    // Robust checks to find the array
    if (Array.isArray(res.data)) {
      console.log("✅ Found array in res.data:", res.data);
      return res.data;
    }
    if (res.data && Array.isArray(res.data.data)) {
      console.log("✅ Found array in res.data.data:", res.data.data);
      return res.data.data;
    }
    if (res.data && Array.isArray(res.data.items)) {
      console.log("✅ Found array in res.data.items:", res.data.items);
      return res.data.items;
    }

    console.warn("⚠️ No array found in response!", res.data);
    return [];
  }
};