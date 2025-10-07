import axios from "axios";

import type { UpdateVendorData, VendorResponse } from "./vendors.types";

const API_URL = import.meta.env.VITE_API_URL;

export const vendorService = {
  fetchVendors: async (
    limit: number,
    page: number,
    offset: number
  ): Promise<VendorResponse[]> => {
    const res = await axios.get(`${API_URL}/vendors`, {
      params: { limit, page, offset },
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  fetchVendorName: async (
    limit: number,
    page: number,
    offset: number
  ): Promise<VendorResponse[]> => {
    const res = await axios.get(`${API_URL}/vendors/summary`, {
      params: { limit, page, offset },
      headers: { Accept: "application/json" },
    });
    return res.data;
  },

  fetchVendorById: async (id: string): Promise<VendorResponse> => {
    const res = await axios.get(`${API_URL}/vendors/${id}`);
    return res.data;
  },

  createVendor: async (data: FormData): Promise<VendorResponse> => {
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
