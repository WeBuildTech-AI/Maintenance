import api from "./api";

export type MeterType = "manual" | "automated";

// Type definitions 
export interface Meter {
  id : string;
  organizationId : string;
  name : string;
  meterType?: MeterType;
  description?: string;
  unit?: string;
  assetId?: string;
  locationId?: string;
  readingFrequency ?: any;
  photos : string[];
  createdAt: Date;
  updatedAt : Date;
}

// For API responses
export type MeterResponse = Meter;

// For creating new meters
export interface CreateMeterData {
  organizationId : string;
  name : string;
  meterType?: MeterType;
  description?: string;
  unit?: string;
  assetId?: string;
  locationId?: string;
  readingFrequency ?: any;
  photos : string[];
}

// For updating existing meters
export interface UpdateMeterData {
  organizationId : string;
  name : string;
  meterType?: MeterType;
  description?: string;
  unit?: string;
  assetId?: string;
  locationId?: string;
  readingFrequency ?: any;
  photos : string[];
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
