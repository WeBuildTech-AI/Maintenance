import type { BUD } from "../../components/utils/BlobUpload";

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
  partImages?: BUD[];
  partDocs?: BUD[];
}

export interface CreatePartData {
  organizationId: string;
  name: string;
  description?: string;
  unitCost?: number;
  unitInStock: number;
  minInStock: number;
  area: string;
  locationId: string;
  qrCode?: string;
  photos?: string[];
  partsType?: string[];
  location?: Record<string, any>;
  assetIds?: string[];
  teamsInCharge?: string[];
  vendorIds?: string[];
  files?: string[];

  partImages?: BUD[];
  partDocs?: BUD[];
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

  partImages?: BUD[];
  partDocs?: BUD[];
}

// ✅ API FILTER PARAMETERS
export interface FetchPartsParams {
  page?: number | string;
  limit?: number | string;
  name?: string; // Fuzzy search on part name
  
  // Dynamic Keys from QueryBuilder
  [key: string]: any; 
}

export interface PartsState {
  parts: PartResponse[];
  selectedPart: PartResponse | null;
  loading: boolean;
  error: string | null;
  restockLogs: PartRestockLog[]; 
  selectedRestockLog: PartRestockLog | null;
}

export interface PartRestockLog {
  id: string;
  partId: string;
  locationId: string;
  unitsAdded: number;
  notes: string | null;
  restockImages: BUD[];
  createdAt: string;

  location: {
    id: string;
    name: string;
  };

  part?: {
    id: string;
    name: string;
  };
}

export interface RestockThunkArgs {
  partId: string;
  locationId: string;
  addedUnits: number;
  notes?: string;
  restockImages: BUD[];
}