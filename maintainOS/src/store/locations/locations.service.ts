import axios from "axios";

import type {
  CreateLocationData,
  LocationResponse,
  UpdateLocationData,
} from "./locations.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const locationService = {
  fetchLocations: async (): Promise<LocationResponse[]> => {
    const res = await axios.get(`${API_URL}/locations`);
    return res.data;
  },

  fetchLocationById: async (id: string): Promise<LocationResponse> => {
    const res = await axios.get(`${API_URL}/locations/${id}`);
    return res.data;
  },

  createLocation: async (
    data: CreateLocationData
  ): Promise<LocationResponse> => {
    const res = await axios.post(`${API_URL}/locations`, data);
    return res.data;
  },

  updateLocation: async (
    id: string,
    data: UpdateLocationData
  ): Promise<LocationResponse> => {
    const res = await axios.patch(`${API_URL}/locations/${id}`, data);
    return res.data;
  },

  deleteLocation: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/locations/${id}`);
  },
};
