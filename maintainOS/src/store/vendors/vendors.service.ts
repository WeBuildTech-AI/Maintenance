import axios from "axios";
import type { VendorResponse, Contact } from "./vendors.types";

const API_URL = import.meta.env.VITE_API_URL;
import api from "../auth/auth.service";
export const vendorService = {
  // ✅ Fetch all vendors
  fetchVendors: async (): Promise<VendorResponse[]> => {
    const res = await api.get(`/vendors`, {
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  // ✅ Fetch vendor summary (names)
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

  // ✅ Update vendor
  updateVendor: async (
    id: string,
    data: Partial<VendorResponse>
  ): Promise<VendorResponse> => {
    const res = await api.patch(`/vendors/${id}`, data);
    return res.data;
  },

  // ✅ Delete vendor
  deleteVendor: async (id: string): Promise<void> => {
    await api.delete(`/vendors/${id}`);
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

  // ✅ Update or create (PUT)
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
    await api.delete(`vendor/batch-delete`, {
      data: { ids: ids },
    });
  },
};


