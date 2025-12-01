import axios from "axios";
import type { PartResponse, FetchPartsParams } from "./parts.types"; // ✅ Imported Types
import type { RestockThunkArgs, PartRestockLog } from "./parts.types";
import api from "../auth/auth.service";

const API_URL = import.meta.env.VITE_API_URL;

export const partService = {
  // ✅ Updated to accept params object
  fetchParts: async (params?: FetchPartsParams): Promise<PartResponse[]> => {
    const res = await api.get(`/parts`, {
      params,
      // Ensure arrays are serialized correctly
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

  createPart: async (data: FormData): Promise<PartResponse> => {
    const res = await api.post(`/parts`, data);
    return res.data;
  },

  updatePart: async (id: string, data: FormData): Promise<PartResponse> => {
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

  // RESTOCK API THUNKS BELOW

  restockPart: async (
    partId: string,
    payload: RestockThunkArgs
  ): Promise<PartResponse> => {
    const formData = new FormData();

    formData.append("locationId", payload.locationId);
    formData.append("addedUnits", String(payload.addedUnits));
    if (payload.notes) {
      formData.append("notes", payload.notes);
    }

    if (payload.restockImages && payload.restockImages.length > 0) {
      formData.append("restockImages", JSON.stringify(payload.restockImages));
    }

    const res = await api.post(`/parts/${partId}/restock`, formData);
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