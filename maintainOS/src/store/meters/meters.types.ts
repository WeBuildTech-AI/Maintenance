export interface MeterResponse {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  meterType?: "manual" | "automated";
  unit?: string;
  assetId?: string;
  locationId?: string;
  readingFrequency?: Record<string, any>;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeterData {
  organizationId: string;
  name: string;
  meterType?: "manual" | "automated";
  description?: string;
  unit?: string;
  assetId?: string;
  locationId?: string;
  readingFrequency?: Record<string, any>;
  photos?: string[];
}

export interface UpdateMeterData {
  name?: string;
  description?: string;
  meterType?: "manual" | "automated";
  unit?: string;
  assetId?: string;
  locationId?: string;
  readingFrequency?: Record<string, any>;
  photos?: string[];
}

export interface MetersState {
  meters: MeterResponse[];
  selectedMeter: MeterResponse | null;
  loading: boolean;
  error: string | null;
}
