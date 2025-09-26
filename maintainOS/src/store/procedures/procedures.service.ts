import axios from "axios";

import type {
  CreateProcedureData,
  ProcedureResponse,
  UpdateProcedureData,
} from "./procedures.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const procedureService = {
  fetchProcedures: async (): Promise<ProcedureResponse[]> => {
    const res = await axios.get(`${API_URL}/procedures`);
    return res.data;
  },

  fetchProcedureById: async (id: string): Promise<ProcedureResponse> => {
    const res = await axios.get(`${API_URL}/procedures/${id}`);
    return res.data;
  },

  createProcedure: async (
    data: CreateProcedureData
  ): Promise<ProcedureResponse> => {
    const res = await axios.post(`${API_URL}/procedures`, data);
    return res.data;
  },

  updateProcedure: async (
    id: string,
    data: UpdateProcedureData
  ): Promise<ProcedureResponse> => {
    const res = await axios.patch(`${API_URL}/procedures/${id}`, data);
    return res.data;
  },

  deleteProcedure: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/procedures/${id}`);
  },
};
