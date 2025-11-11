
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

export interface CreateAssetData {
  organizationId: string;
  year:number;
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
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
}

export interface UpdateAssetStatus {
  status: string;
  notes: string;
  since: string;
  downtimeType: string;
  userId: string;
}

export interface AssetsState {
  assets: AssetResponse[];
  selectedAsset: AssetResponse | null;
  loading: boolean;
  error: string | null;
}
