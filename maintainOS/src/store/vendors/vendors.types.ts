export interface VendorResponse {
  id: string;
  organizationId: string;
  name: string;
  pictureUrl?: string;
  color?: string;
  description?: string;
  contacts?: Record<string, any>;
  files?: string[];
  locations?: string[];
  assetIds?: string[];
  partIds?: string[];
  vendorType?: "manufacturer" | "distributor";
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorData {
  organizationId: string;
  name: string;
  pictureUrl?: string;
  color?: string;
  description?: string;
  contacts?: Record<string, any>;
  files?: string[];
  locations?: string[];
  assetIds?: string[];
  partIds?: string[];
  vendorType?: "manufacturer" | "distributor";
}

export interface UpdateVendorData {
  name?: string;
  pictureUrl?: string;
  color?: string;
  description?: string;
  contacts?: Record<string, any>;
  files?: string[];
  locations?: string[];
  assetIds?: string[];
  partIds?: string[];
  vendorType?: "manufacturer" | "distributor";
}

export interface VendorsState {
  vendors: VendorResponse[];
  selectedVendor: VendorResponse | null;
  loading: boolean;
  error: string | null;
}
