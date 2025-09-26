import axios from "axios";

import type {
  CreateVendorData,
  UpdateVendorData,
  VendorResponse,
} from "./vendors.types";

const API_URL = import.meta.env.VITE_API_URL;

export const vendorService = {
  fetchVendors: async (): Promise<VendorResponse[]> => {
    const res = await axios.get(`${API_URL}/vendors`);
    return res.data;
  },

  fetchVendorById: async (id: string): Promise<VendorResponse> => {
    const res = await axios.get(`${API_URL}/vendors/${id}`);
    return res.data;
  },

  createVendor: async (data: CreateVendorData): Promise<VendorResponse> => {
    const res = await axios.post(`${API_URL}/vendors`, data);
    return res.data;
  },

  updateVendor: async (
    id: string,
    data: UpdateVendorData
  ): Promise<VendorResponse> => {
    const res = await axios.patch(`${API_URL}/vendors/${id}`, data);
    return res.data;
  },

  deleteVendor: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/vendors/${id}`);
  },
};
