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
  unitInStock:number;
  minInStock:number;
  area:string;
  locationId:string;
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

export interface PartsState {
  parts: PartResponse[];
  selectedPart: PartResponse | null;
  loading: boolean;
  error: string | null;
}

export interface RestockThunkArgs {
  partId: string;
  locationId: string;
  addedUnits: number;
  notes?: string;
  restockImages: BUD[]; 
}
