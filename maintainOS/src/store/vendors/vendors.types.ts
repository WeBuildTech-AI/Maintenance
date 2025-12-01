import type { BUD } from "../utils/BlobUpload";

export type VendorContact = {
  id?: string; // Added optional ID based on response
  name: string;
  role?: string;
  phone?: string;
  phoneExtension?: string;
  email?: string;
  color?: string;
  // Handling backend variations
  fullName?: string;
  phoneNumber?: string;
  contactColor?: string;
};

export type VendorLocation = {
  id?: string;
  name: string;
  parent?: string;
};

export type VendorAsset = {
  id: string;
  name: string;
};

export type Vendor = {
  id: string;
  organizationId?: string; // Added from response
  description?: string;
  name: string;
  color?: string; // Changed from category/services to match response better
  
  // These might be deprecated in your new response, but keeping for safety if used elsewhere
  category?: string; 
  services?: string[];

  vendorType?: "manufacturer" | "distributor" | string; // Added
  
  vendorImages: BUD[];
  vendorDocs: BUD[];
  
  contacts: VendorContact[];
  
  locations: VendorLocation[];
  
  // ID Arrays
  assetIds?: string[];
  partIds?: string[];
  workOrderIds?: string[]; // Added

  // Populated Data
  assets?: VendorAsset[]; // Added
  parts?: any[]; // Parts logic already existed, ensuring type support
  
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  partsSummary?: string;
  isDeleted?: boolean;
};

// ... keep existing VendorResponse interface if needed, or unify. 
// For this fix, the Vendor type above is the critical one used in components.
export interface FetchVendorsParams {
  page?: number | string;
  limit?: number | string;
  search?: string; 
  [key: string]: any; 
}

export interface VendorsState {
  vendors: Vendor[]; // Updated to use the robust Vendor type
  selectedVendor: Vendor | null;
  loading: boolean;
  error: string | null;
}