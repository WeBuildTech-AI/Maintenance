import axios from "axios";
import type { VendorResponse, Contact } from "./vendors.types";

const API_URL = import.meta.env.VITE_API_URL;

export const vendorService = {
  // ✅ Fetch all vendors
  fetchVendors: async (): Promise<VendorResponse[]> => {
    const res = await axios.get(`${API_URL}/vendors`, {
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  // ✅ Fetch vendor summary (names)
  fetchVendorName: async (): Promise<VendorResponse[]> => {
    const res = await axios.get(`${API_URL}/vendors/summary`);
    return res.data;
  },

  // ✅ Fetch single vendor
  fetchVendorById: async (id: string): Promise<VendorResponse> => {
    const res = await axios.get(`${API_URL}/vendors/${id}`);
    return res.data;
  },

  // ✅ Create vendor
  createVendor: async (data: FormData): Promise<VendorResponse> => {
    const res = await axios.post(`${API_URL}/vendors`, data);
    return res.data;
  },

  // ✅ Update vendor
  updateVendor: async (
    id: string,
    data: Partial<VendorResponse>
  ): Promise<VendorResponse> => {
    const res = await axios.patch(`${API_URL}/vendors/${id}`, data);
    return res.data;
  },

  // ✅ Delete vendor
  deleteVendor: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/vendors/${id}`);
  },

  // ✅ Create new contact
  createVendorContact: async (
    vendorId: string,
    contactData: Contact
  ): Promise<Contact> => {
    const res = await axios.post(
      `${API_URL}/vendors/${vendorId}/contacts`,
      contactData,
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  },

  // ✅ Update or create (PUT)
  updateVendorContact: async (
    vendorId: string,
    contactId: string,
    contactData: Contact
  ): Promise<Contact> => {
    const res = await axios.put(
      `${API_URL}/vendors/${vendorId}/contacts/${contactId}`,
      contactData,
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  },
};
