export interface AssetResponse {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status?: string;
  locationId?: string;
  criticality?: string;
  pictures?: string[];
  files?: string[];
  manufacturer?: string; // Response might still return object/string, kept flexible
  model?: string;
  serialNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetData {
  organizationId?: string;
  year: number;
  name: string;
  description?: string;
  status?: string;
  locationId?: string;
  criticality?: string;
  pictures?: string[];
  files?: string[];
  manufacturerId?: string; // ✅ Renamed from manufacturer
  model?: string;
  serialNumber?: string;
  [key: string]: any;
}

export interface CreateAssetType {
  organizationId: string;
  name: string;
}

export interface UpdateAssetData {
  name?: string;
  description?: string;
  status?: string;
  locationId?: string;
  criticality?: string;
  pictures?: string[];
  files?: string[];
  manufacturerId?: string; // ✅ Renamed from manufacturer
  model?: string;
  serialNumber?: string;
  [key: string]: any;
}

export interface UpdateAssetStatus {
  status: string;
  notes: string;
  since: string;
  downtimeType: string;
  userId: string;
}

// API FILTER PARAMETERS
export interface FetchAssetsParams {
  page?: number;
  limit?: number;
  name?: string;
  
  // UI Filter Keys
  status?: string | string[];
  criticality?: string | string[];
  location?: any;
  manufacturer?: any;
  vendor?: any;
  part?: any;
  teamsInCharge?: any;
  assetTypes?: any;
  downtimeType?: any;
  downtimeReason?: any;
  description?: string;
  serialNumber?: string;
  year?: string;
  workOrderRecurrence?: string;
  asset?: any;

  // Strict API Keys
  statusOneOf?: string;
  locationOneOf?: string;
  [key: string]: any;
}