import api from "./api";
import type { Meter, MeterType } from "@prisma/client";

// Re-export Prisma types for convenience
export type { Meter, MeterType } from "@prisma/client";

// For API responses
export type MeterResponse = Meter;

// For creating new meters
export interface CreateMeterData {
  organizationId: string;
  assetId: string;
  name: string;
  type: MeterType;
  unit?: string;
  description?: string;
  currentReading?: number;
  lastReadingDate?: string;
  targetReading?: number;
  isActive?: boolean;
}

// For updating existing meters
export interface UpdateMeterData {
  assetId?: string;
  name?: string;
  type?: MeterType;
  unit?: string;
  description?: string;
  currentReading?: number;
  lastReadingDate?: string;
  targetReading?: number;
  isActive?: boolean;
}

export const meterService = {
  // Fetch all meters
  fetchMeters: async (): Promise<MeterResponse[]> => {
    const response = await api.get("/meters");
    return response.data;
  },

  // Fetch meter by ID
  fetchMeterById: async (id: string): Promise<MeterResponse> => {
    const response = await api.get(`/meters/${id}`);
    return response.data;
  },

  // Create a new meter
  createMeter: async (meterData: CreateMeterData): Promise<MeterResponse> => {
    const response = await api.post("/meters", meterData);
    return response.data;
  },

  // Update meter
  updateMeter: async (
    id: string,
    meterData: UpdateMeterData
  ): Promise<MeterResponse> => {
    const response = await api.patch(`/meters/${id}`, meterData);
    return response.data;
  },

  // Delete meter
  deleteMeter: async (id: string): Promise<void> => {
    await api.delete(`/meters/${id}`);
  },
};
