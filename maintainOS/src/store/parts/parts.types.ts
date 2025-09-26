export interface PartResponse {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  unitCost?: number;
  qrCode?: string;
  photos?: string[];
  partsType?: string[];
  location?: Record<string, any>;
  assetIds?: string[];
  teamsInCharge?: string[];
  vendorIds?: string[];
  files?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartData {
  organizationId: string;
  name: string;
  description?: string;
  unitCost?: number;
  qrCode?: string;
  photos?: string[];
  partsType?: string[];
  location?: Record<string, any>;
  assetIds?: string[];
  teamsInCharge?: string[];
  vendorIds?: string[];
  files?: string[];
}

export interface UpdatePartData {
  name?: string;
  description?: string;
  unitCost?: number;
  qrCode?: string;
  photos?: string[];
  partsType?: string[];
  location?: Record<string, any>;
  assetIds?: string[];
  teamsInCharge?: string[];
  vendorIds?: string[];
  files?: string[];
}

export interface PartsState {
  parts: PartResponse[];
  selectedPart: PartResponse | null;
  loading: boolean;
  error: string | null;
}
