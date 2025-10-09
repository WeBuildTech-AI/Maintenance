import axios from "axios";

import type {
  CreateLocationData,
  LocationResponse,
  UpdateLocationData,
} from "./locations.types";

const API_URL = import.meta.env.VITE_API_URL;

export const locationService = {
  fetchLocations: async (
    limit: number,
    page: number,
    offset: number
  ): Promise<LocationResponse[]> => {
    const res = await axios.get(`${API_URL}/locations`, {
      params: { limit, page, offset },
      headers: { Accept: "application/json" },
    });

    return res.data;
  },
  fetchLocationsName: async (): Promise<LocationResponse[]> => {
    const res = await axios.get(`${API_URL}/locations/summary`);

    return res.data;
  },

  fetchLocationById: async (id: string): Promise<LocationResponse> => {
    const res = await axios.get(`${API_URL}/locations/${id}`);
    return res.data;
  },

  createLocation: async (
    data: CreateLocationData
  ): Promise<LocationResponse> => {
    const res = await axios.post(`${API_URL}/locations`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
