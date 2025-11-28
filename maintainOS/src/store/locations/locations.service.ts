import axios from "axios";
import api from "../auth/auth.service";
import type { LocationResponse } from "./locations.types";

const API_URL = import.meta.env.VITE_API_URL;

export const locationService = {
  fetchLocations: async (
    limit: number,
    page: number,
  ): Promise<LocationResponse[]> => {
    const res = await api.get("/locations", {
      params: { limit, page },
      // headers: { Accept: "application/json" },
    });

    return res.data.items;
  },
  fetchLocationsName: async (): Promise<LocationResponse[]> => {
    const res = await api.get("/locations/summary");

    return res.data;
  },

  fetchLocationById: async (id: string): Promise<LocationResponse> => {
    const res = await api.get(`/locations/${id}`);
    return res.data;
  },

  createLocation: async (data: FormData): Promise<LocationResponse> => {
    const res = await api.post("/locations", data);
    return res.data;
  },

  updateLocation: async (
    id: string,
    data: FormData
  ): Promise<LocationResponse> => {
    const res = await api.patch(`/locations/${id}`, data);
    return res.data;
  },

  deleteLocation: async (id: string): Promise<void> => {
    await api.delete(`/locations/${id}`);
  },

  batchDeleteLocation: async (ids: string[]): Promise<void> => {
    await api.delete(`locations/batch-delete`, {
      data: { ids: ids },
    });
  },

  fetchDeleteLocation: async (): Promise<void> => {
    const res = await api.get(`locations/deleted/all`);
    return res.data;
  },

  restoreLocationData: async (id: string): Promise<LocationResponse> => {
    const res = await api.patch(`/locations/${id}/restore`);
    return res.data;
  },
};
