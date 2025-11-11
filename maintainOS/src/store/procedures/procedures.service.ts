import api from "../auth/auth.service";
import type {
  CreateProcedureData,
  ProcedureResponse,
  UpdateProcedureData,
} from "./procedures.types";


export const procedureService = {
  // ✅ GET: Fetch all procedure templates
  fetchProcedures: async (): Promise<ProcedureResponse[]> => {
    const res = await api.get(`procedures`);
    return res.data;
  },

  // ✅ GET: Fetch a single procedure template by ID
  fetchProcedureById: async (id: string): Promise<ProcedureResponse> => {
    // API: GET /procedures/{id}
    const res = await api.get(`procedures/${id}`);
    return res.data;
  },

  // ✅ POST: Create a new procedure template
  createProcedure: async (
    data: CreateProcedureData
  ): Promise<ProcedureResponse> => {
    // API: POST /procedures
    const res = await api.post(`procedures`, data);
    return res.data;
  },

  // ✅ PATCH: Update an existing procedure template
  updateProcedure: async (
    id: string,
    data: UpdateProcedureData
  ): Promise<ProcedureResponse> => {
    // API: PATCH /procedures/{id}
    const res = await api.patch(`procedures/${id}`, data);
    return res.data;
  },

  // ✅ DELETE: Delete a procedure template
  deleteProcedure: async (id: string): Promise<void> => {
    // API: DELETE /procedures/{id}
    await api.delete(`procedures/${id}`);
  },
};