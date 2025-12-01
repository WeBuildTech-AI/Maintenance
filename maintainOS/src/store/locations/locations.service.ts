
import api from "../auth/auth.service";
import type { LocationResponse, FetchLocationsParams } from "./locations.types"; // ✅ Imported Types


export const locationService = {
  // ✅ Updated to accept params object
  fetchLocations: async (
    params?: FetchLocationsParams
  ): Promise<LocationResponse[]> => {
    const res = await api.get("/locations", {
      params,
      // Ensure arrays are serialized correctly (e.g. teamsOneOf=id1,id2)
      paramsSerializer: { indexes: null },
      // headers: { Accept: "application/json" },
    });

    // Handle potential response structures
    if (res.data && Array.isArray(res.data.items)) return res.data.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
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