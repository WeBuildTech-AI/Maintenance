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
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ NEW: Added interfaces for Logs based on your JSON
export interface AssetLog {
  id: string;
  assetId: string;
  userId: string;
  previousStatus: string;
  status: string;
  notes: string | null;
  since: string;
  to: string | null;
  downtimeType: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface AssetLogResponse {
  assetId: string;
  totalLogs: number;
  filters: any;
  logs: AssetLog[];
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
  manufacturerId?: string;
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
  manufacturerId?: string;
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

export interface FetchAssetsParams {
  page?: number;
  limit?: number;
  name?: string;
  
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

  statusOneOf?: string;
  locationOneOf?: string;
  [key: string]: any;
}