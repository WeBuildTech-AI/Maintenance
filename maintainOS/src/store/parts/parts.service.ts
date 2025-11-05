import axios from "axios";
import type { PartResponse } from "./parts.types";
import type { RestockThunkArgs, PartRestockLog } from "./parts.types";
import api from "../auth/auth.service";

const API_URL = import.meta.env.VITE_API_URL;

export const partService = {
  fetchParts: async (): Promise<PartResponse[]> => {
    const res = await api.get(`/parts`, {
      headers: { Accept: "application/json" },
    });
    return res.data;
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

  // ✅ RESTOCK PART - ID goes in URL
  // restockPart: async (
  //   partId: string,
  //   locationId: string,
  //   addedUnits: number
  // ): Promise<PartResponse> => {
  //   const formData = new FormData();
  //   formData.append("locationId", locationId);
  //   formData.append("addedUnits", String(addedUnits));

  //   const res = await axios.post(
  //     `${API_URL}/parts/${partId}/restock`,
  //     formData,
  //     { headers: { Accept: "application/json" } }
  //   );
  //   return res.data;
  // },
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

    const res = await api.post(
      `/parts/${partId}/restock`,
      formData
    );
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
};
