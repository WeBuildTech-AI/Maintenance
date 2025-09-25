import api from "./api";

export type VendorType = "manufacturer" | "distributor";

export interface Vendor {
  id: string;
  organizationId: string;
  name: string;
  pictureUrl?: string;
  color?: string;
  description?: string;
  contacts?: any; 
  files: string[];
  locations: string[];
  assetIds: string[];
  partIds: string[];
  vendorType?: VendorType;
  createdAt: Date;
  updatedAt: Date;
}

// For API responses
export type VendorResponse = Vendor;

// For creating new vendors
export interface CreateVendorData {
  organizationId: string;
  name: string;
  pictureUrl?: string;
  color?: string;
  description?: string;
  contacts?: any; 
  files: string[];
  locations: string[];
  assetIds: string[];
  partIds: string[];
  vendorType?: VendorType;
}

// For updating existing vendors
export interface UpdateVendorData {
  organizationId: string;
  name: string;
  pictureUrl?: string;
  color?: string;
  description?: string;
  contacts?: any; 
  files: string[];
  locations: string[];
  assetIds: string[];
  partIds: string[];
  vendorType?: VendorType;
}

export const vendorService = {
  // Fetch all vendors
  fetchVendors: async (): Promise<VendorResponse[]> => {
    const response = await api.get("/vendors");
    return response.data;
  },

  // Fetch vendor by ID
  fetchVendorById: async (id: string): Promise<VendorResponse> => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },

  // Create a new vendor
  createVendor: async (
    vendorData: CreateVendorData
  ): Promise<VendorResponse> => {
    const response = await api.post("/vendors", vendorData);
    return response.data;
  },

  // Update vendor
  updateVendor: async (
    id: string,
    vendorData: UpdateVendorData
  ): Promise<VendorResponse> => {
    const response = await api.patch(`/vendors/${id}`, vendorData);
    return response.data;
  },

  // Delete vendor
  deleteVendor: async (id: string): Promise<void> => {
    await api.delete(`/vendors/${id}`);
  },
};
