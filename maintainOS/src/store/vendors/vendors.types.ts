export interface Contact {
  fullName: string;
  email: string;
  role?: string;
  phoneNumber?: string;
  phoneExtension?: string;
  contactColor?: string; // ✅ backend expects `contactColor`
}

export interface VendorResponse {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  color?: string;
  contacts?: Contact[];
  files?: string[];
  locations?: string[];
  assetIds?: string[];
  partIds?: string[];
  vendorType?: "manufacturer" | "distributor";
  createdAt: string;
  updatedAt: string;
}

export interface VendorsState {
  vendors: VendorResponse[];
  selectedVendor: VendorResponse | null;
  loading: boolean;
  error: string | null;
}
