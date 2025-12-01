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
  MeasurementRes: [];
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
export interface UpdateMeterReading {
  value: number; // Convertir el valor del input (string) a número
  meterId: string;
}

// ✅ API FILTER PARAMETERS
export interface FetchMetersParams {
  page?: number | string;
  limit?: number | string;
  name?: string; // API uses 'name' for fuzzy search
  
  // Dynamic Keys from QueryBuilder (e.g. assetOneOf, locationIsEmpty)
  [key: string]: any; 
}

export interface MetersState {
  meters: MeterResponse[];
  selectedMeter: MeterResponse | null;
  loading: boolean;
  error: string | null;
}