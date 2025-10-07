export interface Contact {
  fullName: string;
  email: string;
  role?: string;
  phoneNumber?: string;
  contactColour?: string;
}

export interface VendorResponse {
  id: string;
  organizationId: string;
  name: string;
  pictureUrl?: string;
  color?: string;
  description?: string;
  contacts?: Contact[];
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
  contacts?: Contact[];
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
  contacts?: Contact[];
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
