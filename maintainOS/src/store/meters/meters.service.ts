import axios from "axios";
import api from "../auth/auth.service";
import type {
  CreateMeterData,
  MeterResponse,
  UpdateMeterData,
  UpdateMeterReading,
  FetchMetersParams, // ✅ Imported
} from "./meters.types";

const API_URL = import.meta.env.VITE_API_URL;

export const meterService = {
  // ✅ Updated to accept params object
  fetchMeters: async (
    params?: FetchMetersParams
  ): Promise<MeterResponse[]> => {
    const res = await api.get(`/meters`, {
      params,
      // Ensure arrays are serialized correctly (e.g. assetOneOf=id1,id2)
      paramsSerializer: { indexes: null },
      headers: { Accept: "application/json" },
    });

    // Handle both potential response structures just in case
    if (res.data && Array.isArray(res.data.items)) return res.data.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  fetchMeterById: async (id: string): Promise<MeterResponse> => {
    const res = await api.get(`/meters/${id}`);
    return res.data;
  },

  createMeter: async (data: CreateMeterData): Promise<MeterResponse> => {
    const res = await api.post(`/meters`, data);
    return res.data;
  },

  fetchMesurementUnit: async (): Promise<MeterResponse> => {
    const res = await api.get(`/measurements`);
    return res.data;
  },

  updateMeter: async (
    id: string,
    data: UpdateMeterData
  ): Promise<MeterResponse> => {
    const res = await api.patch(`/meters/${id}`, data);
    return res.data;
  },

  deleteMeter: async (id: string): Promise<void> => {
    await api.delete(`meters/batch-delete`, {
      data: { ids: [id] },
    });
  },

  updateMeterReading: async (
    id: string,
    data: UpdateMeterReading
  ): Promise<MeterResponse> => {
    const res = await api.post(`/meters/${id}/readings`, data);
    return res.data;
  },

  batchDeleteMeter: async (ids: string[]): Promise<void> => {
    await api.delete(`meters/batch-delete`, {
      data: { ids: ids },
    });
  },
  fetchDeleteMeter: async (): Promise<void> => {
    const res = await api.get(`meters/deleted/all`);
    return res.data;
  },

  restoreMeterData: async (id: string): Promise<MeterResponse> => {
    const res = await api.patch(`/meters/${id}/restore`);
    return res.data;
  },

  fetchMetersSummary: async (): Promise<MeterResponse[]> => {
    const res = await api.get(`/meters/summary`);
    return res.data;
  },
};