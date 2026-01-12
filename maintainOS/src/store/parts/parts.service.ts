import api from "../auth/auth.service";
import type { 
  PartResponse, 
  FetchPartsParams, 
  CreatePartPayload, 
  UpdatePartPayload 
} from "./parts.types";
import type { RestockThunkArgs, PartRestockLog } from "./parts.types";

export const partService = {
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

  // ✅ CREATE: Sends JSON Object
  createPart: async (data: CreatePartPayload): Promise<PartResponse> => {
    const res = await api.post(`/parts`, data);
    return res.data;
  },

  // ✅ UPDATE: Sends JSON Object
  updatePart: async (id: string, data: UpdatePartPayload): Promise<PartResponse> => {
    const res = await api.patch(`/parts/${id}`, data);
    return res.data;
  },

  deletePart: async (id: string): Promise<void> => {
    await api.delete(`/parts/${id}`);
  },

  fetchPartsName: async (): Promise<PartResponse[]> => {
    const res = await api.get(`/parts/summary`, {
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  // ✅ RESTOCK: JSON Object
  restockPart: async (partId: string, payload: RestockThunkArgs): Promise<PartResponse> => {
    // We pass payload directly as JSON. 
    // Ensure your backend Restock endpoint also accepts JSON body.
    const res = await api.post(`/parts/${partId}/restock`, payload);
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

  fetchDeletePart: async (): Promise<void> => {
    const res = await api.get(`parts/deleted/all`);
    return res.data;
  },

  restorePartData: async (id: string): Promise<PartResponse> => {
    const res = await api.patch(`/parts/${id}/restore`);
    return res.data;
  },
};