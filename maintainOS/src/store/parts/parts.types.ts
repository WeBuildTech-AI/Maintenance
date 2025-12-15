import type { BUD } from "../../components/utils/BlobUpload";

// Sub-types for nested objects
export interface PartLocation {
  id?: string;
  locationId: string;
  area?: string;
  unitsInStock: number;
  minimumInStock: number;
  name?: string; // Optional for display
  locationName?: string; // Optional for display
}

export interface PartVendor {
  vendorId: string;
  orderingPartNumber?: string;
  name?: string; // Optional for display
}

// JSON Payload Structure for Creating a Part
export interface CreatePartPayload {
  organizationId: string;
  name: string;
  description?: string;
  unitCost?: number;
  qrCode?: string;
  
  partsType?: string[]; 
  assetIds?: string[];
  teamsInCharge?: string[];
  vendorIds?: string[];
  
  locations?: PartLocation[];
  vendors?: PartVendor[];
  
  partImages?: BUD[];
  partDocs?: BUD[];
  
  files?: string[];
}

export interface UpdatePartPayload extends Partial<CreatePartPayload> {}

export interface PartResponse {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  unitCost?: number;
  qrCode?: string;
  photos?: string[];
  partsType?: string[] | { name: string }[]; // Handle mixed response types
  locations?: PartLocation[];
  assetIds?: string[];
  teamsInCharge?: string[];
  vendorIds?: string[];
  vendors?: PartVendor[] | { id: string; name: string }[];
  assets?: { id: string; name: string }[];
  teams?: { id: string; name: string }[];
  files?: string[];
  
  createdAt: string;
  updatedAt: string;
  
  // ✅ Added Creator/Updater Fields
  createdBy?: string;
  updatedBy?: string;

  partImages?: BUD[];
  partDocs?: BUD[];
  
  totalStock?: number;
  minStock?: number;
}

export interface FetchPartsParams {
  page?: number | string;
  limit?: number | string;
  name?: string;
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