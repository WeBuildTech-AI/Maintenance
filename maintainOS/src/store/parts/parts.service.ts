import axios from "axios";

import type {
  CreatePartData,
  PartResponse,
  UpdatePartData,
} from "./parts.types";

const API_URL = import.meta.env.VITE_API_URL;

export const partService = {
  fetchParts: async (): Promise<PartResponse[]> => {
    const res = await axios.get(`${API_URL}/parts`);
    return res.data;
  },

  fetchPartById: async (id: string): Promise<PartResponse> => {
    const res = await axios.get(`${API_URL}/parts/${id}`);
    return res.data;
  },

  createPart: async (data: CreatePartData): Promise<PartResponse> => {
    const res = await axios.post(`${API_URL}/parts`, data);
    return res.data;
  },

  updatePart: async (
    id: string,
    data: UpdatePartData
  ): Promise<PartResponse> => {
    const res = await axios.patch(`${API_URL}/parts/${id}`, data);
    return res.data;
  },

  deletePart: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/parts/${id}`);
  },
};
