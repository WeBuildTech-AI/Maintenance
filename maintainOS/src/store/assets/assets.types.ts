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

export interface AssetsState {
  assets: AssetResponse[];
  selectedAsset: AssetResponse | null;
  loading: boolean;
  error: string | null;
}
