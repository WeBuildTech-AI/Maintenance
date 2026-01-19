import type { VendorResponse, Contact, FetchVendorsParams } from "./vendors.types";
import api from "../auth/auth.service";

export const vendorService = {
  // ✅ Fetch all vendors with Filters
  fetchVendors: async (params?: FetchVendorsParams): Promise<VendorResponse[]> => {
    const res = await api.get(`/vendors`, {
      params,
      paramsSerializer: { indexes: null }, 
    });
    
    if (res.data && Array.isArray(res.data.items)) return res.data.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  // ✅ Fetch vendor summary
  fetchVendorName: async (): Promise<VendorResponse[]> => {
    const res = await api.get(`/vendors/summary`);
    return res.data;
  },

  // ✅ Fetch single vendor
  fetchVendorById: async (id: string): Promise<VendorResponse> => {
    const res = await api.get(`/vendors/${id}`);
    return res.data;
  },

  // ✅ Create vendor
  createVendor: async (data: FormData): Promise<VendorResponse> => {
    const res = await api.post(`/vendors`, data);
    return res.data;
  },

  // ✅ Update Vendor (PATCH) - WAS MISSING
  updateVendor: async (id: string, data: FormData): Promise<VendorResponse> => {
    const res = await api.patch(`/vendors/${id}`, data);
    return res.data;
  },

  // ✅ Create new contact
  createVendorContact: async (
    vendorId: string,
    contactData: Contact
  ): Promise<Contact> => {
    const res = await api.post(`/vendors/${vendorId}/contacts`, contactData, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  // ✅ Update contact
  updateVendorContact: async (
    vendorId: string,
    contactId: string,
    contactData: Contact
  ): Promise<Contact> => {
    const res = await api.put(
      `/vendors/${vendorId}/contacts/${contactId}`,
      contactData,
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  },

  batchDeleteVendor: async (ids: string[]): Promise<void> => {
    await api.delete(`vendors/batch-delete`, {
      data: { ids: ids },
    });
  },

  deleteVendor: async (id: string): Promise<void> => {
    await api.delete(`vendors/batch-delete`, {
      data: { ids: [id] },
    });
  },

  fetchVendorContact: async (id: string): Promise<VendorResponse> => {
    const res = await api.get(`/vendors/${id}/contacts`);
    return res.data;
  },

  fetchVendorContactData: async (
    vendorId: string,
    contactId: string[]
  ): Promise<Contact> => {
    const res = await api.get(`/vendors/${vendorId}/contacts/${contactId}`);
    return res.data;
  },
  
  fetchDeleteVendor: async (): Promise<VendorResponse[]> => {
    const res = await api.get(`/vendors/deleted`);
    return res.data;
  },

  restoreVendorData: async (id: string): Promise<void> => {
    await api.put(`/vendors/${id}/restore`);
  },

  // ✅ Fetch User Details (for Footer)
  fetchUser: async (id: string): Promise<any> => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
};