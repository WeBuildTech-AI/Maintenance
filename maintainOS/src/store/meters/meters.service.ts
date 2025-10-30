import axios from "axios";

import type {
  CreateMeterData,
  MeterResponse,
  UpdateMeterData,
} from "./meters.types";

const API_URL = import.meta.env.VITE_API_URL;

export const meterService = {
  fetchMeters: async (
    limit: number,
    page: number,
    offset: number
  ): Promise<MeterResponse[]> => {
    const res = await axios.get(`${API_URL}/meters`, {
      params: { limit, page, offset },
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  fetchMeterById: async (id: string): Promise<MeterResponse> => {
    const res = await axios.get(`${API_URL}/meters/${id}`);
    return res.data;
  },

  createMeter: async (data: CreateMeterData): Promise<MeterResponse> => {
    const res = await axios.post(`${API_URL}/meters`, data);
    return res.data;
  },
  
  fetchMesurementUnit: async (): Promise<MeterResponse> => {
    const res = await axios.get(`${API_URL}/measurements`);
    return res.data;
  },

  updateMeter: async (
    id: string,
    data: UpdateMeterData
  ): Promise<MeterResponse> => {
    const res = await axios.patch(`${API_URL}/meters/${id}`, data);
    return res.data;
  },

  deleteMeter: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/meters/${id}`);
  },
};
