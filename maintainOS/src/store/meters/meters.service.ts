import axios from "axios";

import type {
  CreateMeterData,
  MeterResponse,
  UpdateMeterData,
} from "./meters.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const meterService = {
  fetchMeters: async (): Promise<MeterResponse[]> => {
    const res = await axios.get(`${API_URL}/meters`);
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
