import api from "../auth/auth.service";
import type {
  CreateProcedureData,
  ProcedureResponse,
  UpdateProcedureData,
} from "./procedures.types";


export const procedureService = {
  fetchProcedures: async (): Promise<ProcedureResponse[]> => {
    const res = await api.get(`procedures`);
    return res.data;
  },

  fetchProcedureById: async (id: string): Promise<ProcedureResponse> => {
    const res = await api.get(`procedures/${id}`);
    return res.data;
  },

  createProcedure: async (
    data: CreateProcedureData
  ): Promise<ProcedureResponse> => {
    const res = await api.post(`procedures`, data);
    return res.data;
  },

  updateProcedure: async (
    id: string,
    data: UpdateProcedureData
  ): Promise<ProcedureResponse> => {
    const res = await api.patch(`procedures/${id}`, data);
    return res.data;
  },

  deleteProcedure: async (id: string): Promise<void> => {
    await api.delete(`procedures/${id}`);
  },
};
