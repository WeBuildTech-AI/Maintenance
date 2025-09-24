import api from "./api";
import type { Vendor } from "@prisma/client";

// Re-export Prisma types for convenience
export type { Vendor } from "@prisma/client";

// For API responses
export type VendorResponse = Vendor;

// For creating new vendors
export interface CreateVendorData {
  name: string;
  organizationId: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  notes?: string;
}

// For updating existing vendors
export interface UpdateVendorData {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  notes?: string;
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
